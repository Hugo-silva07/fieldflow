from django.urls import path

from demands.views import (
    AssignNextDemandAPIView,
    ChangeDemandStatusAPIView,
    DemandSummaryAPIView,
    PutDemandOnStandbyAPIView,
    ReassignDemandAPIView,
    SendDemandToReassignmentAPIView,
    StandbyDemandsAPIView,
    DemandHistoryAPIView,
    CurrentDemandAPIView,
    QueueStatusAPIView,
    InterruptCurrentDemandAPIView,
)


urlpatterns = [
        # FILA
        path(
            "assign-next/",
            AssignNextDemandAPIView.as_view(),
            name="assign-next-demand",
        ),

        # AÇÕES
        path(
            "<int:demand_id>/change-status/",
            ChangeDemandStatusAPIView.as_view(),
            name="change-demand-status",
        ),
        path(
            "<int:demand_id>/standby/",
            PutDemandOnStandbyAPIView.as_view(),
            name="put-demand-on-standby",
        ),
        path(
            "<int:demand_id>/send-to-reassignment/",
            SendDemandToReassignmentAPIView.as_view(),
            name="send-demand-to-reassignment",
        ),
        path(
            "<int:demand_id>/reassign/",
            ReassignDemandAPIView.as_view(),
            name="reassign-demand",
        ),

        # LISTAGENS
        path(
            "standby/",
            StandbyDemandsAPIView.as_view(),
            name="standby-demands",
        ),
        path(
            "history/",
            DemandHistoryAPIView.as_view(),
            name="demand-history",
        ),

        path(
            "current/",
            CurrentDemandAPIView.as_view(),
            name="current-demand",
        ),

        path(
            "queue-status/",
            QueueStatusAPIView.as_view(),
            name="queue-status",
        ),

        path(
            "interrupt-current/",
            InterruptCurrentDemandAPIView.as_view(),
            name="interrupt-current-demand",
        ),

        path(
            "summary/",
            DemandSummaryAPIView.as_view(),
            name="demand-summary",
        ),
    ]