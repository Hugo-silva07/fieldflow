from django.db import transaction
from django.utils import timezone

from demands.exceptions import NoDemandAvailableError
from demands.models import Demand, DemandAssignment, DemandHistory
from demands.tma import start_tma_cycle


@transaction.atomic
def assign_next_demand(
    *,
    user,
    queue_id=None,
    team_id=None,
    operation_id=None,
    organization_id=None,
):
    active_demand = Demand.objects.filter(
        assigned_to=user,
        status=Demand.Status.IN_PROGRESS,
        is_active=True,
    ).first()

    if active_demand:
        return active_demand

    qs = Demand.objects.select_for_update().filter(
        is_active=True,
        status__in=[
            Demand.Status.PENDING,
            Demand.Status.INTERRUPTED,
        ],
    )

    if queue_id is not None:
        qs = qs.filter(queue_id=queue_id)

    if team_id is not None:
        qs = qs.filter(team_id=team_id)

    if operation_id is not None:
        qs = qs.filter(operation_id=operation_id)

    if organization_id is not None:
        qs = qs.filter(organization_id=organization_id)

    interrupted_demand = (
        qs.filter(
            status=Demand.Status.INTERRUPTED,
            return_to_user=user,
        )
        .order_by("updated_at")
        .first()
    )

    if interrupted_demand:
        demand = interrupted_demand
    else:
        demand = (
            qs.filter(status=Demand.Status.PENDING)
            .order_by("fifo_date", "id")
            .first()
        )

    if not demand:
        raise NoDemandAvailableError("Nenhuma demanda disponível para atribuição.")

    now = timezone.now()
    old_status = demand.status

    DemandAssignment.objects.filter(
        demand=demand,
        is_current=True,
    ).update(
        is_current=False,
        ended_at=now,
    )

    demand.assigned_to = user

    if demand.assigned_at is None:
        demand.assigned_at = now

    if demand.started_at is None:
        demand.started_at = now

    demand.status = Demand.Status.IN_PROGRESS
    start_tma_cycle(demand)
    demand.last_updated_by = user
    demand.save(
        update_fields=[
            "assigned_to",
            "assigned_at",
            "started_at",
            "status",
            "last_updated_by",
            "current_cycle_started_at",
            "updated_at",
        ]
    )

    DemandAssignment.objects.create(
        demand=demand,
        user=user,
        assigned_by=user,
        is_current=True,
    )

    DemandHistory.objects.create(
        demand=demand,
        actor=user,
        action="ASSIGNED",
        from_status=old_status,
        to_status=Demand.Status.IN_PROGRESS,
        observation=(
            "Demanda retomada automaticamente."
            if old_status == Demand.Status.INTERRUPTED
            else "Demanda atribuída via fila FIFO."
        ),
        metadata={
            "queue_id": demand.queue_id,
            "team_id": demand.team_id,
            "operation_id": demand.operation_id,
            "organization_id": demand.organization_id,
        },
    )

    return demand