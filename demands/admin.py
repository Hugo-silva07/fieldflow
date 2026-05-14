from django.contrib import admin
from .models import Queue, Demand, DemandHistory, DemandAssignment


@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "operation",
        "team",
        "priority_order",
        "is_active",
        "created_at",
    )
    list_filter = ("operation", "team", "is_active")
    search_fields = ("name", "slug", "operation__name", "team__name")


@admin.register(Demand)
class DemandAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "shop_id",
        "status",
        "organization",
        "operation",
        "team",
        "queue",
        "assigned_to",
        "fifo_date",
        "retry_at",
        "is_priority",
        "is_active",
    )
    list_filter = (
        "status",
        "organization",
        "operation",
        "team",
        "queue",
        "is_priority",
        "is_active",
        "menu_created",
    )
    search_fields = (
        "shop_id",
        "external_id",
        "title",
        "info",
    )
    autocomplete_fields = (
        "organization",
        "operation",
        "team",
        "queue",
        "assigned_to",
        "return_to_user",
        "created_by",
        "last_updated_by",
    )


@admin.register(DemandHistory)
class DemandHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "demand",
        "actor",
        "action",
        "from_status",
        "to_status",
        "created_at",
    )
    list_filter = ("action", "from_status", "to_status", "created_at")
    search_fields = ("demand__shop_id", "observation")
    autocomplete_fields = ("demand", "actor")


@admin.register(DemandAssignment)
class DemandAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "demand",
        "user",
        "assigned_by",
        "started_at",
        "ended_at",
        "is_current",
    )
    list_filter = ("is_current", "started_at")
    search_fields = ("demand__shop_id", "user__username")
    autocomplete_fields = ("demand", "user", "assigned_by")