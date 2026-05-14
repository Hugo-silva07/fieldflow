from django.contrib.auth import get_user_model
from django.db.models import Avg, DurationField, ExpressionWrapper, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta
from demands.tma import stop_tma_cycle

from demands.actions.demand_actions import (
    assign_next_demand_action,
    change_demand_status_action,
    put_demand_on_standby_action,
    reassign_demand_action,
    send_demand_to_reassignment_action,
)
from demands.api_response import success_response
from demands.models import Demand, DemandHistory
from demands.output_serializers import DemandOutputSerializer
from demands.serializers import (
    AssignNextDemandSerializer,
    ChangeDemandStatusSerializer,
    PutDemandOnStandbySerializer,
    ReassignDemandSerializer,
    SendDemandToReassignmentSerializer,
)

User = get_user_model()


class AssignNextDemandAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AssignNextDemandSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        demand = assign_next_demand_action(
            user=request.user,
            queue_id=data.get("queue_id"),
            team_id=data.get("team_id"),
            operation_id=data.get("operation_id"),
            organization_id=data.get("organization_id"),
        )

        output = DemandOutputSerializer(demand)
        return success_response(data=output.data)


class CurrentDemandAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        demand = (
            Demand.objects.filter(
                assigned_to=request.user,
                status=Demand.Status.IN_PROGRESS,
                is_active=True,
            )
            .order_by("-updated_at")
            .first()
        )

        if not demand:
            return Response({"success": True, "data": None})

        output = DemandOutputSerializer(demand)
        return success_response(data=output.data)


class ChangeDemandStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, demand_id):
        demand = get_object_or_404(Demand, id=demand_id)

        serializer = ChangeDemandStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        demand = change_demand_status_action(
            demand=demand,
            new_status=data["new_status"],
            actor=request.user,
            observation=data.get("observation", ""),
        )

        output = DemandOutputSerializer(demand)
        return success_response(data=output.data)


class PutDemandOnStandbyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, demand_id):
        demand = get_object_or_404(Demand, id=demand_id)

        serializer = PutDemandOnStandbySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        demand = put_demand_on_standby_action(
            demand=demand,
            actor=request.user,
            reason=data["reason"],
            retry_at=data["retry_at"],
            note=data.get("note", ""),
        )

        output = DemandOutputSerializer(demand)
        return success_response(data=output.data)


class SendDemandToReassignmentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, demand_id):
        demand = get_object_or_404(Demand, id=demand_id)

        serializer = SendDemandToReassignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        demand = send_demand_to_reassignment_action(
            demand=demand,
            actor=request.user,
            note=data.get("note", ""),
        )

        output = DemandOutputSerializer(demand)
        return success_response(data=output.data)


class ReassignDemandAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, demand_id):
        demand = get_object_or_404(Demand, id=demand_id)

        serializer = ReassignDemandSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        new_user = get_object_or_404(User, id=data["new_user_id"])

        demand = reassign_demand_action(
            demand=demand,
            new_user=new_user,
            actor=request.user,
            note=data.get("note", ""),
            start_immediately=data.get("start_immediately", True),
        )

        output = DemandOutputSerializer(demand)
        return success_response(data=output.data)


class StandbyDemandsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        demands = Demand.objects.filter(
            status__in=[
                Demand.Status.STANDBY_STORE_CLOSED,
                Demand.Status.STANDBY_NEXT_DAY,
                Demand.Status.REASSIGNMENT_PENDING,
            ],
            is_active=True,
        ).order_by("retry_at", "fifo_date")

        serializer = DemandOutputSerializer(demands, many=True)
        return success_response(data=serializer.data)


class DemandHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = (
            DemandHistory.objects.select_related("demand", "actor")
            .filter(actor=request.user)
            .order_by("-created_at")[:20]
        )

        data = [
            {
                "id": item.id,
                "demand_id": item.demand_id,
                "shop_id": item.demand.shop_id,
                "task_type": item.demand.title or item.demand.external_id or "-",
                "action": item.action,
                "from_status": item.from_status,
                "to_status": item.to_status,
                "observation": item.observation,
                "created_at": item.created_at,
            }
            for item in history
        ]

        return success_response(data=data)


class DemandSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()

        user_history = DemandHistory.objects.filter(
            actor=request.user,
            created_at__date=today,
        )

        finished = user_history.filter(to_status=Demand.Status.FINISHED).count()
        standby = user_history.filter(action="PUT_ON_STANDBY").count()
        reassigned = user_history.filter(action="REASSIGNED").count()

        demands = Demand.objects.filter(
            last_updated_by=request.user,
            updated_at__date=today,
            active_seconds__gt=0,
        )

        total_seconds = sum(demand.active_seconds for demand in demands)

        total_demands = demands.count()

        average_minutes = 0

        if total_demands > 0:
            average_minutes = int(
                (total_seconds / total_demands) / 60
            )

        return success_response(
            data={
                "finished": finished,
                "standby": standby,
                "reassigned": reassigned,
                "average_minutes": average_minutes,
            }
        )
class QueueStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending = Demand.objects.filter(
            status=Demand.Status.PENDING,
            is_active=True,
        ).count()

        standby = Demand.objects.filter(
            status__in=[
                Demand.Status.STANDBY_STORE_CLOSED,
                Demand.Status.STANDBY_NEXT_DAY,
                Demand.Status.PENDING_INFO,
                Demand.Status.REASSIGNMENT_PENDING,
            ],
            is_active=True,
        ).count()

        interrupted = Demand.objects.filter(
            status=Demand.Status.INTERRUPTED,
            return_to_user=request.user,
            is_active=True,
        ).count()

        return success_response(
            data={
                "pending": pending,
                "standby": standby,
                "interrupted": interrupted,
            }
        )
    
class InterruptCurrentDemandAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        demand = (
            Demand.objects.filter(
                assigned_to=request.user,
                status=Demand.Status.IN_PROGRESS,
                is_active=True,
            )
            .order_by("-updated_at")
            .first()
        )

        if not demand:
            return success_response(data=None)

        old_status = demand.status

        demand.status = Demand.Status.INTERRUPTED
        demand.return_to_user = request.user
        demand.last_updated_by = request.user
        stop_tma_cycle(demand)
        demand.save(
            update_fields=[
                "status",
                "return_to_user",
                "last_updated_by",
                "updated_at",
                "current_cycle_started_at",
                "active_seconds",
            ]
        )

        DemandHistory.objects.create(
            demand=demand,
            actor=request.user,
            action="INTERRUPTED",
            from_status=old_status,
            observation=request.data.get(
                "reason",
                "Demanda interrompida automaticamente.",
            ),
        )

        return success_response(data=DemandOutputSerializer(demand).data)
        