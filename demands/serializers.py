from django.contrib.auth import get_user_model
from rest_framework import serializers

from demands.models import Demand

User = get_user_model()


class AssignNextDemandSerializer(serializers.Serializer):
    queue_id = serializers.IntegerField(required=False)
    team_id = serializers.IntegerField(required=False)
    operation_id = serializers.IntegerField(required=False)
    organization_id = serializers.IntegerField(required=False)


class ChangeDemandStatusSerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(choices=Demand.Status.choices)
    observation = serializers.CharField(required=False, allow_blank=True)


class PutDemandOnStandbySerializer(serializers.Serializer):
    reason = serializers.ChoiceField(choices=Demand.StandbyReason.choices)
    retry_at = serializers.DateTimeField()
    note = serializers.CharField(required=False, allow_blank=True)


class SendDemandToReassignmentSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)


class ReassignDemandSerializer(serializers.Serializer):
    new_user_id = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True)
    start_immediately = serializers.BooleanField(required=False, default=True)

    def validate_new_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Usuário informado não existe.")
        return value