from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    class Role(models.TextChoices):
        FOUNDER = "founder", "Founder"
        INVESTOR = "investor", "Investor"

    role = models.CharField(max_length=20, choices=Role.choices)
    bio = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
