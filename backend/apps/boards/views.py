from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Board, Column, Task
from .serializers import BoardSerializer, ColumnSerializer, TaskSerializer
from apps.workspaces.models import WorkspaceMember


class IsBoardWorkspaceMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Funciona tanto para Board como para Column y Task
        if hasattr(obj, 'workspace'):
            workspace = obj.workspace
        elif hasattr(obj, 'board'):
            workspace = obj.board.workspace
        elif hasattr(obj, 'column'):
            workspace = obj.column.board.workspace
        else:
            return False
        return WorkspaceMember.objects.filter(
            workspace=workspace, user=request.user
        ).exists()


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class   = BoardSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardWorkspaceMember]

    def get_queryset(self):
        return Board.objects.filter(
            workspace__members__user=self.request.user
        ).prefetch_related('columns__tasks')


class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class   = ColumnSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardWorkspaceMember]

    def get_queryset(self):
        return Column.objects.filter(
            board__workspace__members__user=self.request.user
        ).prefetch_related('tasks')

    @action(detail=True, methods=['patch'], url_path='reorder')
    def reorder(self, request, pk=None):
        column = self.get_object()
        order  = request.data.get('order')
        if order is None:
            return Response(
                {'detail': 'El campo order es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        column.order = order
        column.save(update_fields=['order'])
        return Response(ColumnSerializer(column).data)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardWorkspaceMember]

    def get_queryset(self):
        return Task.objects.filter(
            column__board__workspace__members__user=self.request.user
        ).prefetch_related('taskassignee_set__user')

    @action(detail=True, methods=['patch'], url_path='move')
    def move(self, request, pk=None):
        task      = self.get_object()
        column_id = request.data.get('column')
        order     = request.data.get('order')

        if column_id:
            task.column_id = column_id
        if order is not None:
            task.order = order

        task.save(update_fields=['column_id', 'order'])
        return Response(TaskSerializer(task, context={'request': request}).data)
