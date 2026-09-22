from django.contrib import admin
from .models import ConnectionRequest


class ConnectionRequestAdmin(admin.ModelAdmin):
    list_display = ("idea", "investor", "status", "requested_at", "accepted_at")
    list_filter = ("status",)


admin.site.register(ConnectionRequest, ConnectionRequestAdmin)