from django.urls import path

from accounts.views import MeAPIView

urlpatterns = [
    path("me/", MeAPIView.as_view(), name="me"),
]