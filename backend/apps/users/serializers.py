from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar_url', 'bio']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords dont match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user