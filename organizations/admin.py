from django.contrib import admin
from .models import Organization, Operation, Team


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "code", "timezone", "is_active", "created_at")
    search_fields = ("name", "code", "organization__name")
    list_filter = ("is_active", "organization")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "operation", "is_active", "created_at")
    search_fields = ("name", "operation__name", "operation__organization__name")
    list_filter = ("is_active", "operation")