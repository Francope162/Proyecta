from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.email