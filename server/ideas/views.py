from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Idea, IdeaReport
from .serializers import IdeaCreateSerializer, IdeaTeaserSerializer, IdeaDetailSerializer
from analysis.report_generator import generate_report


class IdeaCreateView(generics.CreateAPIView):
    serializer_class = IdeaCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        idea = serializer.save(founder=self.request.user)

        try:
            report_data = generate_report(idea)
            IdeaReport.objects.create(
                idea=idea,
                executive_summary=report_data.get("executive_summary", ""),
                problem_validation=report_data.get("problem_validation", ""),
                solution_evaluation=report_data.get("solution_evaluation", ""),
                target_customer_analysis=report_data.get("target_customer_analysis", ""),
                tam=report_data.get("market_size", {}).get("tam", ""),
                sam=report_data.get("market_size", {}).get("sam", ""),
                som=report_data.get("market_size", {}).get("som", ""),
                competitor_analysis=report_data.get("competitor_analysis", ""),
                competitive_advantage=report_data.get("competitive_advantage", ""),
                business_model_analysis=report_data.get("business_model_analysis", ""),
                revenue_potential=report_data.get("revenue_potential", ""),
                market_trends=report_data.get("market_trends", ""),
                risk_analysis=report_data.get("risk_analysis", ""),
                funding_recommendation=report_data.get("funding_recommendation", ""),
                customer_segments=report_data.get("customer_segments", ""),
                go_to_market_strategy=report_data.get("go_to_market_strategy", ""),
                ai_validation_score=report_data.get("ai_validation_score"),
                recommendations=report_data.get("recommendations", ""),
                raw_response=report_data,
            )
            idea.status = Idea.Status.PUBLISHED
        except Exception as e:
            idea.status = Idea.Status.FAILED
            print(f"Report generation failed for idea {idea.id}: {e}")
        idea.save()


class IdeaListView(generics.ListAPIView):
    queryset = Idea.objects.filter(status="published").select_related("founder").order_by("-created_at")
    serializer_class = IdeaTeaserSerializer
    permission_classes = [permissions.IsAuthenticated]


class IdeaDetailView(generics.RetrieveAPIView):
    queryset = Idea.objects.select_related("founder", "report")
    serializer_class = IdeaDetailSerializer
    permission_classes = [permissions.IsAuthenticated]