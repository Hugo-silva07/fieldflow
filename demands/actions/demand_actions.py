from demands.services.assignment import assign_next_demand
from demands.services.reassignment import (
    reassign_demand,
    send_demand_to_reassignment,
)
from demands.services.standby import (
    put_demand_on_standby,
    return_expired_standby_demands,
)
from demands.services.status import change_demand_status


def assign_next_demand_action(
    *,
    user,
    queue_id=None,
    team_id=None,
    operation_id=None,
    organization_id=None,
):
    return assign_next_demand(
        user=user,
        queue_id=queue_id,
        team_id=team_id,
        operation_id=operation_id,
        organization_id=organization_id,
    )


def change_demand_status_action(
    *,
    demand,
    new_status,
    actor=None,
    observation="",
):
    return change_demand_status(
        demand=demand,
        new_status=new_status,
        actor=actor,
        observation=observation,
    )


def put_demand_on_standby_action(
    *,
    demand,
    actor,
    reason,
    retry_at,
    note="",
):
    return put_demand_on_standby(
        demand=demand,
        actor=actor,
        reason=reason,
        retry_at=retry_at,
        note=note,
    )


def return_expired_standby_demands_action():
    return return_expired_standby_demands()


def send_demand_to_reassignment_action(
    *,
    demand,
    actor,
    note="",
):
    return send_demand_to_reassignment(
        demand=demand,
        actor=actor,
        note=note,
    )


def reassign_demand_action(
    *,
    demand,
    new_user,
    actor,
    note="",
    start_immediately=True,
):
    return reassign_demand(
        demand=demand,
        new_user=new_user,
        actor=actor,
        note=note,
        start_immediately=start_immediately,
    )