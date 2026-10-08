from django.urls import path
from .views import (
    IdeaCreateView,
    IdeaListView,
    IdeaDetailView,
    MyIdeasView,
    DashboardStatsView,
)

urlpatterns = [
    path("", IdeaListView.as_view(), name="idea-list"),
    path("submit/", IdeaCreateView.as_view(), name="idea-create"),
    path("mine/", MyIdeasView.as_view(), name="idea-mine"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("<int:pk>/", IdeaDetailView.as_view(), name="idea-detail"),
]
