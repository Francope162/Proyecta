from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer

User = get_user_model()

class IsWorkspaceOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class   = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def get_queryset(self):
        # Returns workspaces where the user is a member
        return Workspace.objects.filter(members__user=self.request.user)
    
    @action(detail=True, methods=['get'], url_path='members')
    def list_members(self, request, pk=None):
        workspace = self.get_object()
        members = workspace.members.select_related('user').all()
        
        serializer = WorkspaceMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='invite')
    def invite(self, request, pk=None):
        workspace = self.get_object()
        if workspace.owner != request.user:
            return Response(
                {'detail': 'Only the owner can invite.'},
                status=status.HTTP_403_FORBIDDEN
            )
        email = request.data.get('email')
        role  = request.data.get('role', WorkspaceMember.Role.MEMBER)

        user = get_object_or_404(User, email=email)

        if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
            return Response(
                {'detail': 'The user is already a member.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        member = WorkspaceMember.objects.create(
            workspace=workspace, user=user, role=role
        )
        return Response(WorkspaceMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        workspace = self.get_object()
        if workspace.owner != request.user:
            return Response(
                {'detail': 'Only the owner can delete members.'},
                status=status.HTTP_403_FORBIDDEN
            )
        member = get_object_or_404(WorkspaceMember, workspace=workspace, user_id=user_id)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
