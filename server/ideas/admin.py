from django.contrib import admin
from .models import Idea, IdeaReport


class IdeaReportInline(admin.StackedInline):
    model = IdeaReport
    extra = 0


class IdeaAdmin(admin.ModelAdmin):
    list_display = ("title", "founder", "industry", "stage", "status", "published_at", "created_at")
    list_filter = ("status", "stage", "business_model")
    search_fields = ("title", "idea", "founder__email")
    inlines = [IdeaReportInline]


admin.site.register(Idea, IdeaAdmin)