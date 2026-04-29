from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, UpdateProfileSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateProfileSerializer
        return UserSerializer

class UserProfileView(generics.RetrieveAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field       = 'username'