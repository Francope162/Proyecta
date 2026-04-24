from rest_framework import serializers
from .models import Workspace, WorkspaceMember
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

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'slug', 'owner', 'members', 'created_at']
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