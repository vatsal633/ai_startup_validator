from django.urls import path
from .views import IdeaCreateView, IdeaListView, IdeaDetailView

urlpatterns = [
    path("", IdeaListView.as_view(), name="idea-list"),
    path("submit/", IdeaCreateView.as_view(), name="idea-create"),
    path("<int:pk>/", IdeaDetailView.as_view(), name="idea-detail"),
]