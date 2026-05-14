from django.db import transaction
from django.utils import timezone

from demands.exceptions import InvalidReassignmentOperationError
from demands.models import Demand, DemandAssignment, DemandHistory
from demands.tma import start_tma_cycle, stop_tma_cycle


@transaction.atomic
def send_demand_to_reassignment(
    *,
    demand,
    actor,
    note="",
):
    if demand.status not in {
        Demand.Status.IN_PROGRESS,
        Demand.Status.REASSIGNMENT_PENDING,
        Demand.Status.PENDING,
        Demand.Status.STANDBY_STORE_CLOSED,
        Demand.Status.STANDBY_NEXT_DAY,
        Demand.Status.PENDING_INFO,
    }:
        raise InvalidReassignmentOperationError(
            "Só é possível reatribuir demandas em andamento, pendentes, em standby ou aguardando reatribuição."
        )

    now = timezone.now()
    old_status = demand.status
    previous_user_id = demand.assigned_to_id

    if old_status == Demand.Status.IN_PROGRESS:
        stop_tma_cycle(demand)

    DemandAssignment.objects.filter(
        demand=demand,
        is_current=True,
    ).update(
        is_current=False,
        ended_at=now,
    )

    demand.status = Demand.Status.REASSIGNMENT_PENDING
    demand.reassignment_count += 1
    demand.return_to_user = demand.assigned_to
    demand.assigned_to = None
    demand.assigned_at = None
    demand.last_updated_by = actor
    demand.save(
        update_fields=[
            "status",
            "reassignment_count",
            "return_to_user",
            "assigned_to",
            "assigned_at",
            "last_updated_by",
            "current_cycle_started_at",
            "active_seconds",
            "updated_at",
        ]
    )

    DemandHistory.objects.create(
        demand=demand,
        actor=actor,
        action="SENT_TO_REASSIGNMENT",
        from_status=old_status,
        to_status=Demand.Status.REASSIGNMENT_PENDING,
        observation=note or "Demanda enviada para reatribuição.",
        metadata={
            "previous_user_id": previous_user_id,
        },
    )

    return demand


@transaction.atomic
def reassign_demand(
    *,
    demand,
    new_user,
    actor,
    note="",
    start_immediately=True,
):
    if new_user is None:
        raise InvalidReassignmentOperationError(
            "É obrigatório informar um usuário válido para reatribuição."
        )

    if demand.status not in {
        Demand.Status.REASSIGNMENT_PENDING,
        Demand.Status.PENDING,
        Demand.Status.STANDBY_STORE_CLOSED,
        Demand.Status.STANDBY_NEXT_DAY,
        Demand.Status.PENDING_INFO,
    }:
        raise InvalidReassignmentOperationError(
            "Só é possível reatribuir demandas pendentes, em standby ou aguardando reatribuição."
        )

    now = timezone.now()
    old_status = demand.status
    started_at_changed = False

    DemandAssignment.objects.filter(
        demand=demand,
        is_current=True,
    ).update(
        is_current=False,
        ended_at=now,
    )

    demand.assigned_to = new_user
    demand.assigned_at = now
    demand.last_updated_by = actor

    if start_immediately:
        demand.status = Demand.Status.IN_PROGRESS
        if demand.started_at is None:
            demand.started_at = now
            started_at_changed = True

        start_tma_cycle(demand)
    else:
        demand.status = Demand.Status.PENDING
        demand.current_cycle_started_at = None

    update_fields = [
        "assigned_to",
        "assigned_at",
        "status",
        "last_updated_by",
        "current_cycle_started_at",
        "updated_at",
    ]

    if started_at_changed:
        update_fields.append("started_at")

    demand.save(update_fields=update_fields)

    DemandAssignment.objects.create(
        demand=demand,
        user=new_user,
        assigned_by=actor,
        is_current=True,
    )

    DemandHistory.objects.create(
        demand=demand,
        actor=actor,
        action="REASSIGNED",
        from_status=old_status,
        to_status=demand.status,
        observation=note or "Demanda reatribuída.",
        metadata={
            "new_user_id": new_user.id,
            "start_immediately": start_immediately,
        },
    )

    return demand