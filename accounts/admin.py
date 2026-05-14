from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    fieldsets = UserAdmin.fieldsets + (
        (
            "Informações adicionais",
            {
                "fields": (
                    "role",
                    "phone",
                    "supervisor",
                    "organization",
                    "operation",
                    "team",
                ),
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Informações adicionais",
            {
                "fields": (
                    "role",
                    "phone",
                    "supervisor",
                    "organization",
                    "operation",
                    "team",
                ),
            },
        ),
    )

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "organization",
        "operation",
        "team",
        "supervisor",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "role",
        "organization",
        "operation",
        "team",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )