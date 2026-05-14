from rest_framework import serializers

from demands.models import Demand


class DemandOutputSerializer(serializers.ModelSerializer):
    assigned_to = serializers.IntegerField(source="assigned_to_id", read_only=True)
    return_to_user = serializers.IntegerField(source="return_to_user_id", read_only=True)

    class Meta:
        model = Demand
        fields = [
            "id",
            "shop_id",
            "status",
            "assigned_to",
            "return_to_user",
            "assigned_at",
            "started_at",
            "finished_at",
            "retry_at",
            "standby_reason",
            "standby_note",
            "reassignment_count",
            "standby_count",
            "fifo_date",
        ]