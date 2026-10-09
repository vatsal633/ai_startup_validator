from django.urls import path
from .views import (
    DashboardStatsView,
    IdeaCreateView,
    IdeaDetailView,
    IdeaListView,
    IdeaPublishView,
    IdeaRetryAnalysisView,
    MyIdeasView,
)

urlpatterns = [
    path("", IdeaListView.as_view(), name="idea-list"),
    path("submit/", IdeaCreateView.as_view(), name="idea-create"),
    path("mine/", MyIdeasView.as_view(), name="idea-mine"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("<int:pk>/", IdeaDetailView.as_view(), name="idea-detail"),
    path("<int:pk>/publish/", IdeaPublishView.as_view(), name="idea-publish"),
    path("<int:pk>/retry/", IdeaRetryAnalysisView.as_view(), name="idea-retry"),
]
