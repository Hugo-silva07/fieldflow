from demands.models import Demand
from demands.constants import DemandStatus


def get_all_demands():
    return Demand.objects.all()


def get_pending_demands_queryset():
    return Demand.objects.filter(status=DemandStatus.PENDING)


def get_demands_by_status(status):
    return Demand.objects.filter(status=status)


def get_demands_by_queue(queue):
    return Demand.objects.filter(queue=queue)


def get_demands_by_team(team):
    return Demand.objects.filter(team=team)


def get_demands_by_assigned_user(user):
    return Demand.objects.filter(assigned_to=user)


def get_next_pending_demand(queue=None, team=None, operation=None, organization=None):
    qs = get_pending_demands_queryset()

    if queue is not None:
        qs = qs.filter(queue=queue)

    if team is not None:
        qs = qs.filter(team=team)

    if operation is not None:
        qs = qs.filter(operation=operation)

    if organization is not None:
        qs = qs.filter(organization=organization)

    return qs.order_by("fifo_date", "id").first()


def get_expired_standby_demands():
    from django.utils import timezone

    return Demand.objects.filter(
        status=DemandStatus.STANDBY,
        standby_until__isnull=False,
        standby_until__lte=timezone.now(),
    ).order_by("standby_until", "id")