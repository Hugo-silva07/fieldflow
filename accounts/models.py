from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        SUPERADMIN = "SUPERADMIN", "Super Admin"
        GERENTE = "GERENTE", "Gerente"
        COORDENADOR = "COORDENADOR", "Coordenador"
        ANALISTA = "ANALISTA", "Analista"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        blank=True,
        null=True,
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    supervisor = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subordinates",
    )
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    operation = models.ForeignKey(
        "organizations.Operation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    team = models.ForeignKey(
        "organizations.Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    def __str__(self):
        return self.username