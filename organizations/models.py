from django.db import models


class Organization(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Operation(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="operations",
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    timezone = models.CharField(max_length=100, default="America/Sao_Paulo")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Operação"
        verbose_name_plural = "Operações"
        ordering = ["organization__name", "name"]
        unique_together = ("organization", "name")

    def __str__(self):
        return f"{self.organization.name} - {self.name}"


class Team(models.Model):
    operation = models.ForeignKey(
        Operation,
        on_delete=models.CASCADE,
        related_name="teams",
    )
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Time"
        verbose_name_plural = "Times"
        ordering = ["operation__name", "name"]
        unique_together = ("operation", "name")

    def __str__(self):
        return f"{self.operation.name} - {self.name}"