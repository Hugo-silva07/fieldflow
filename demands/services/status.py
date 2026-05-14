from django.db import transaction
from django.utils import timezone

from demands.exceptions import InvalidStatusTransitionError
from demands.models import Demand, DemandAssignment, DemandHistory
from demands.tma import start_tma_cycle, stop_tma_cycle


ALLOWED_STATUS_TRANSITIONS = {
    Demand.Status.PENDING: {
        Demand.Status.IN_PROGRESS,
    },
    Demand.Status.IN_PROGRESS: {
        Demand.Status.FINISHED,
        Demand.Status.REJECTED_OTHER,
        Demand.Status.STORE_CLOSED,
        Demand.Status.PENDING_INFO,
        Demand.Status.STANDBY_STORE_CLOSED,
        Demand.Status.STANDBY_NEXT_DAY,
        Demand.Status.REASSIGNMENT_PENDING,
    },
    Demand.Status.PENDING_INFO: {
        Demand.Status.IN_PROGRESS,
        Demand.Status.REASSIGNMENT_PENDING,
    },
    Demand.Status.STANDBY_STORE_CLOSED: {
        Demand.Status.PENDING,
        Demand.Status.IN_PROGRESS,
    },
    Demand.Status.STANDBY_NEXT_DAY: {
        Demand.Status.PENDING,
        Demand.Status.IN_PROGRESS,
    },
    Demand.Status.REASSIGNMENT_PENDING: {
        Demand.Status.PENDING,
        Demand.Status.IN_PROGRESS,
    },
    Demand.Status.FINISHED: set(),
    Demand.Status.REJECTED_OTHER: set(),
    Demand.Status.STORE_CLOSED: set(),
}


def can_transition(current_status, new_status):
    return new_status in ALLOWED_STATUS_TRANSITIONS.get(current_status, set())


@transaction.atomic
def change_demand_status(
    *,
    demand,
    new_status,
    actor=None,
    observation="",
):
    old_status = demand.status

    if old_status == new_status:
        return demand

    if not can_transition(old_status, new_status):
        raise InvalidStatusTransitionError(
            f"Transição inválida: {old_status} -> {new_status}"
        )

    now = timezone.now()

    if old_status == Demand.Status.IN_PROGRESS and new_status != Demand.Status.IN_PROGRESS:
        stop_tma_cycle(demand)

    demand.status = new_status
    demand.last_updated_by = actor

    update_fields = [
        "status",
        "last_updated_by",
        "current_cycle_started_at",
        "active_seconds",
        "updated_at",
    ]

    if new_status == Demand.Status.IN_PROGRESS:
        if demand.started_at is None:
            demand.started_at = now
            update_fields.append("started_at")

        start_tma_cycle(demand)

    if new_status in {
        Demand.Status.FINISHED,
        Demand.Status.REJECTED_OTHER,
        Demand.Status.STORE_CLOSED,
    }:
        demand.finished_at = now
        update_fields.append("finished_at")

        DemandAssignment.objects.filter(
            demand=demand,
            is_current=True,
        ).update(
            is_current=False,
            ended_at=now,
        )

    demand.save(update_fields=update_fields)

    DemandHistory.objects.create(
        demand=demand,
        actor=actor,
        action="STATUS_CHANGED",
        from_status=old_status,
        to_status=new_status,
        observation=observation,
        metadata={
            "demand_id": demand.id,
            "assigned_to_id": demand.assigned_to_id,
        },
    )

    return demand