from rest_framework import serializers
from .models import Workspace, WorkspaceMember, WorkspaceInvitation
from apps.users.serializers import UserSerializer

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ['id', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class WorkspaceSerializer(serializers.ModelSerializer):
    owner   = UserSerializer(read_only=True)
    members = WorkspaceMemberSerializer(many=True, read_only=True)
    pending_invitations = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'slug', 'owner', 'members', 'created_at','pending_invitations']
        read_only_fields = ['id', 'owner', 'created_at']

    def create(self, validated_data):
        workspace = Workspace.objects.create(
            owner=self.context['request'].user,
            **validated_data
        )
        
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.context['request'].user,
            role=WorkspaceMember.Role.OWNER
        )
        return workspace
    
    def get_pending_invitations(self, obj):
        invites = obj.invitations.filter(status='pending')
        return InvitationSerializer(invites, many=True).data

class InvitationSerializer(serializers.ModelSerializer):
    # Traemos información legible para el frontend
    workspace_name = serializers.ReadOnlyField(source='workspace.name')
    invited_by_name = serializers.ReadOnlyField(source='invited_by.username')
    
    class Meta:
        model = WorkspaceInvitation
        fields = [
            'id', 
            'workspace', 
            'workspace_name', 
            'email', 
            'role', 
            'status', 
            'invited_by_name', 
            'created_at'
        ]
        read_only_fields = ['status', 'invited_by', 'created_at']

    def validate(self, attrs):
        # Evitar auto-invitarse
        request = self.context.get('request')
        if request and request.user.email == attrs.get('email'):
            raise serializers.ValidationError(
                {"email": "No puedes invitarte a ti mismo al workspace."}
            )
        return attrs