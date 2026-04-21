from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace
import uuid

class Board(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace   = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards')
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='boards')
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.workspace.name} / {self.name}'


class Column(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    name  = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.board.name} / {self.name}'


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW    = 'low',    'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH   = 'high',   'High'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    column      = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='tasks')
    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority    = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    due_date    = models.DateField(null=True, blank=True)
    order       = models.PositiveIntegerField(default=0)
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks'
    )
    assignees   = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='TaskAssignee',
        related_name='assigned_tasks',
        blank=True
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class TaskAssignee(models.Model):
    task      = models.ForeignKey(Task, on_delete=models.CASCADE)
    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('task', 'user')