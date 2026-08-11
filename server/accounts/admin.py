from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

#used to customize the fields in the default UserAdmin according to our needs
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_verified", "is_staff")
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("role", "bio", "is_verified")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Additional Info", {"fields": ("role", "bio", "is_verified")}),
    )


admin.site.register(User, CustomUserAdmin)