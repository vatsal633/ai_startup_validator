from django.contrib import admin
from .models import Idea, IdeaReport


class IdeaReportInline(admin.StackedInline):
    model = IdeaReport
    extra = 0

class IdeaAdmin(admin.ModelAdmin):
    list_display = ("title", "founder", "status", "category", "created_at")
    list_filter = ("status", "category")
    search_fields = ("title", "founder__email")
    inlines = [IdeaReportInline]


admin.site.register(Idea, IdeaAdmin)