from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember, WorkspaceInvitation
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer, InvitationSerializer

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
        email = request.data.get('email')
        role = request.data.get('role', WorkspaceMember.Role.MEMBER)

        # 1. Validar si ya es miembro
        if WorkspaceMember.objects.filter(workspace=workspace, user__email=email).exists():
            return Response({'detail': 'User is already a member.'}, status=400)

        # 2. Crear o actualizar la invitación (get_or_create)
        invitation, created = WorkspaceInvitation.objects.get_or_create(
            workspace=workspace,
            email=email,
            defaults={'invited_by': request.user, 'role': role}
        )

        if not created and invitation.status == 'pending':
            return Response({'detail': 'Invitation already sent.'}, status=400)
        
        # Si ya existía pero fue rechazada, la volvemos a poner pendiente
        if not created and invitation.status != 'pending':
            invitation.status = 'pending'
            invitation.save()

        return Response({'detail': f'Invitation sent to {email}'}, status=201)

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
    
class InvitationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    # GET /api/invitations/ -> Mis invitaciones pendientes
    def list(self, request):
        invites = WorkspaceInvitation.objects.filter(
            email=request.user.email, 
            status='pending'
        )
        # Aquí usarías un InvitationSerializer
        return Response(InvitationSerializer(invites, many=True).data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = get_object_or_404(WorkspaceInvitation, pk=pk, email=request.user.email)
        
        # Crear al miembro oficialmente
        WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=request.user,
            role=invitation.role
        )
        
        # Actualizar estado de la invitación
        invitation.status = WorkspaceInvitation.Status.ACCEPTED
        invitation.save()
        
        return Response({'detail': 'Joined workspace successfully'})

class UserInvitationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvitationSerializer

    def get_queryset(self):
        return WorkspaceInvitation.objects.filter(
            email=self.request.user.email, 
            status='pending'
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        
        # 1. Crear el miembro
        from .models import WorkspaceMember
        WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=request.user,
            role=invitation.role
        )
        
        # 2. Marcar como aceptada
        invitation.status = 'accepted'
        invitation.save()
        
        return Response({'detail': 'Invitación aceptada.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'declined'
        invitation.save()
        return Response({'detail': 'Invitación rechazada.'}, status=status.HTTP_200_OK)
