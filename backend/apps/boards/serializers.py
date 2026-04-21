from rest_framework import serializers
from .models import Board, Column, Task, TaskAssignee
from apps.users.serializers import UserSerializer

class TaskAssigneeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskAssignee
        fields = ['user', 'assigned_at']


class TaskSerializer(serializers.ModelSerializer):
    assignees  = TaskAssigneeSerializer(
        source='taskassignee_set', many=True, read_only=True
    )
    assignee_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'column', 'title', 'description',
            'priority', 'due_date', 'order',
            'assignees', 'assignee_ids',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        assignee_ids = validated_data.pop('assignee_ids', [])
        task = Task.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )
        for user_id in assignee_ids:
            TaskAssignee.objects.create(task=task, user_id=user_id)
        return task

    def update(self, instance, validated_data):
        assignee_ids = validated_data.pop('assignee_ids', None)
        task = super().update(instance, validated_data)
        if assignee_ids is not None:
            TaskAssignee.objects.filter(task=task).delete()
            for user_id in assignee_ids:
                TaskAssignee.objects.create(task=task, user_id=user_id)
        return task


class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ['id', 'board', 'name', 'order', 'tasks']
        read_only_fields = ['id']


class BoardSerializer(serializers.ModelSerializer):
    columns    = ColumnSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Board
        fields = ['id', 'workspace', 'name', 'description', 'columns', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        return Board.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )