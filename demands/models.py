from django.conf import settings
from django.db import models


class Queue(models.Model):
    operation = models.ForeignKey(
        "organizations.Operation",
        on_delete=models.CASCADE,
        related_name="queues",
    )
    team = models.ForeignKey(
        "organizations.Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="queues",
    )
    name = models.CharField(max_length=150)
    slug = models.SlugField()
    description = models.TextField(blank=True, null=True)
    priority_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Fila"
        verbose_name_plural = "Filas"
        ordering = ["priority_order", "name"]
        unique_together = ("operation", "slug")

    def __str__(self):
        return f"{self.operation.name} - {self.name}"


class Demand(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendente"
        IN_PROGRESS = "IN_PROGRESS", "Em andamento"
        INTERRUPTED = "INTERRUPTED", "Interrompida"
        FINISHED = "FINISHED", "Finalizado"
        REJECTED_OTHER = "REJECTED_OTHER", "Rejeitado - Outros"
        STORE_CLOSED = "STORE_CLOSED", "Loja fechada"
        PENDING_INFO = "PENDING_INFO", "Pendente de informação"
        STANDBY_STORE_CLOSED = "STANDBY_STORE_CLOSED", "Standby - Loja fechada"
        STANDBY_NEXT_DAY = "STANDBY_NEXT_DAY", "Standby - Próximo dia"
        REASSIGNMENT_PENDING = "REASSIGNMENT_PENDING", "Aguardando reatribuição"

    class StandbyReason(models.TextChoices):
        STORE_CLOSED = "STORE_CLOSED", "Loja fechada"
        NEXT_DAY = "NEXT_DAY", "Próximo dia"
        OTHER = "OTHER", "Outro"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="demands",
    )
    operation = models.ForeignKey(
        "organizations.Operation",
        on_delete=models.CASCADE,
        related_name="demands",
    )
    team = models.ForeignKey(
        "organizations.Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="demands",
    )
    queue = models.ForeignKey(
        "demands.Queue",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="demands",
    )

    shop_id = models.CharField(max_length=100, db_index=True)
    external_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    info = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=40,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_demands",
    )
    return_to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="return_demands",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_demands",
    )
    last_updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_demands",
    )

    fifo_date = models.DateTimeField(db_index=True)
    due_at = models.DateTimeField(blank=True, null=True, db_index=True)
    retry_at = models.DateTimeField(blank=True, null=True, db_index=True)

    assigned_at = models.DateTimeField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    finished_at = models.DateTimeField(blank=True, null=True)

    current_cycle_started_at = models.DateTimeField(
    blank=True,
    null=True
    )

    active_seconds = models.PositiveIntegerField(
        default=0
    )

    justification = models.TextField(blank=True, null=True)
    inherited_note = models.TextField(blank=True, null=True)
    standby_reason = models.CharField(
        max_length=30,
        choices=StandbyReason.choices,
        blank=True,
        null=True,
    )
    standby_note = models.TextField(blank=True, null=True)

    menu_created = models.BooleanField(blank=True, null=True)

    reassignment_count = models.PositiveIntegerField(default=0)
    standby_count = models.PositiveIntegerField(default=0)

    is_priority = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Demanda"
        verbose_name_plural = "Demandas"
        ordering = ["fifo_date", "id"]
        indexes = [
            models.Index(fields=["status", "fifo_date"]),
            models.Index(fields=["operation", "status"]),
            models.Index(fields=["team", "status"]),
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["queue", "status"]),
            models.Index(fields=["retry_at", "status"]),
            models.Index(fields=["shop_id", "status"]),
        ]

    def __str__(self):
        return f"{self.shop_id} - {self.status}"


class DemandHistory(models.Model):
    demand = models.ForeignKey(
        "demands.Demand",
        on_delete=models.CASCADE,
        related_name="history",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="demand_history_actions",
    )
    action = models.CharField(max_length=60, db_index=True)
    from_status = models.CharField(max_length=40, blank=True, null=True)
    to_status = models.CharField(max_length=40, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Histórico da Demanda"
        verbose_name_plural = "Históricos da Demanda"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["action", "created_at"]),
            models.Index(fields=["actor", "created_at"]),
        ]

    def __str__(self):
        return f"{self.demand_id} - {self.action}"


class DemandAssignment(models.Model):
    demand = models.ForeignKey(
        "demands.Demand",
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="demand_assignments",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="performed_assignments",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    is_current = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Atribuição da Demanda"
        verbose_name_plural = "Atribuições da Demanda"
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["user", "is_current"]),
            models.Index(fields=["demand", "is_current"]),
        ]

    def __str__(self):
        return f"Demanda {self.demand_id} -> {self.user}"