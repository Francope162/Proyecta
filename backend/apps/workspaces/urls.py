from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkspaceViewSet , UserInvitationViewSet

router = DefaultRouter()
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')
router.register(r'user-invitations', UserInvitationViewSet, basename='user-invitations')

urlpatterns = [
    path('', include(router.urls)),
]