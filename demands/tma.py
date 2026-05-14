from django.utils import timezone


def start_tma_cycle(demand):
    """
    Inicia um ciclo ativo de atendimento.
    """

    if demand.current_cycle_started_at is not None:
        return

    demand.current_cycle_started_at = timezone.now()


def stop_tma_cycle(demand):
    """
    Finaliza um ciclo ativo e acumula
    o tempo no active_seconds.
    """

    if demand.current_cycle_started_at is None:
        return

    now = timezone.now()

    diff = now - demand.current_cycle_started_at

    demand.active_seconds += int(diff.total_seconds())

    demand.current_cycle_started_at = None