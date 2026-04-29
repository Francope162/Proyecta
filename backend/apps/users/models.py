from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

def avatar_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'avatars/{instance.id}.{ext}'

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar_url = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.email