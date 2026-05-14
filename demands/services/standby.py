from django.db import transaction
from django.utils import timezone

from demands.exceptions import InvalidStandbyOperationError
from demands.models import Demand, DemandAssignment, DemandHistory
from demands.tma import stop_tma_cycle


STANDBY_STATUS_BY_REASON = {
    Demand.StandbyReason.STORE_CLOSED: Demand.Status.STANDBY_STORE_CLOSED,
    Demand.StandbyReason.NEXT_DAY: Demand.Status.STANDBY_NEXT_DAY,
}


@transaction.atomic
def put_demand_on_standby(
    *,
    demand,
    actor,
    reason,
    retry_at,
    note="",
):
    if demand.status != Demand.Status.IN_PROGRESS:
        raise InvalidStandbyOperationError(
            "Só é possível colocar em standby uma demanda em andamento."
        )

    if reason not in {
        Demand.StandbyReason.STORE_CLOSED,
        Demand.StandbyReason.NEXT_DAY,
        Demand.StandbyReason.OTHER,
    }:
        raise InvalidStandbyOperationError("Motivo de standby inválido.")

    if retry_at is None:
        raise InvalidStandbyOperationError("retry_at é obrigatório para standby.")

    now = timezone.now()
    old_status = demand.status

    stop_tma_cycle(demand)

    if reason == Demand.StandbyReason.OTHER:
        new_status = Demand.Status.PENDING_INFO
    else:
        new_status = STANDBY_STATUS_BY_REASON[reason]

    demand.status = new_status
    demand.retry_at = retry_at
    demand.standby_reason = reason
    demand.standby_note = note
    demand.standby_count += 1
    demand.return_to_user = demand.assigned_to
    demand.last_updated_by = actor
    demand.save(
        update_fields=[
            "status",
            "retry_at",
            "standby_reason",
            "standby_note",
            "standby_count",
            "return_to_user",
            "last_updated_by",
            "current_cycle_started_at",
            "active_seconds",
            "updated_at",
        ]
    )

    DemandAssignment.objects.filter(
        demand=demand,
        is_current=True,
    ).update(
        is_current=False,
        ended_at=now,
    )

    DemandHistory.objects.create(
        demand=demand,
        actor=actor,
        action="PUT_ON_STANDBY",
        from_status=old_status,
        to_status=new_status,
        observation=note or "Demanda colocada em standby.",
        metadata={
            "reason": reason,
            "retry_at": retry_at.isoformat() if retry_at else None,
            "return_to_user_id": demand.return_to_user_id,
        },
    )

    return demand


@transaction.atomic
def return_expired_standby_demands():
    now = timezone.now()

    demands = list(
        Demand.objects.select_for_update().filter(
            retry_at__isnull=False,
            retry_at__lte=now,
            status__in=[
                Demand.Status.STANDBY_STORE_CLOSED,
                Demand.Status.STANDBY_NEXT_DAY,
                Demand.Status.PENDING_INFO,
            ],
            is_active=True,
        )
    )

    updated_demands = []

    for demand in demands:
        old_status = demand.status

        demand.status = Demand.Status.PENDING
        demand.retry_at = None
        demand.last_updated_by = None
        demand.current_cycle_started_at = None
        demand.save(
            update_fields=[
                "status",
                "retry_at",
                "last_updated_by",
                "current_cycle_started_at",
                "updated_at",
            ]
        )

        DemandHistory.objects.create(
            demand=demand,
            actor=None,
            action="AUTO_RETURN_FROM_STANDBY",
            from_status=old_status,
            to_status=Demand.Status.PENDING,
            observation="Retorno automático por vencimento do retry_at.",
            metadata={
                "return_to_user_id": demand.return_to_user_id,
            },
        )

        updated_demands.append(demand)

    return updated_demands