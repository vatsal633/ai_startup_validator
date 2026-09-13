from django.urls import path
from .views import ConnectionRequestCreateView, MyConnectionsView, ConnectionRequestRespondView

urlpatterns = [
    path("request/<int:idea_id>/", ConnectionRequestCreateView.as_view(), name="connection-request"),
    path("", MyConnectionsView.as_view(), name="my-connections"),
    path("<int:pk>/<str:action>/", ConnectionRequestRespondView.as_view(), name="connection-respond"),
]