from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Session(models.Model):
    title = models.CharField(max_length=100, default="New Chat")
    messages = models.TextField(default="[]")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
