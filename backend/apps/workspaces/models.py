from django.db import models
from django.conf import settings
import uuid

class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_workspaces'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WorkspaceMember(models.Model):
    class Role(models.TextChoices):
        OWNER  = 'owner',  'Owner'
        ADMIN  = 'admin',  'Admin'
        MEMBER = 'member', 'Member'

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='members')
    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    role      = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('workspace', 'user')

    def __str__(self):
        return f'{self.user} — {self.workspace} ({self.role})'