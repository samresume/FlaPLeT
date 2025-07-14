from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from .views import ProjectsViewSet, ProjectsInfoViewSet, UserInfoViewSet, UserViewSet, DatasetViewSet, \
    MessageViewSet, FeedbackViewSet, BugReportViewSet, AugmentedDatasetViewSet, FNDatasetViewSet

router = routers.DefaultRouter()
router.register('project', ProjectsViewSet, basename='project')
router.register('dataset', DatasetViewSet, basename='dataset')
router.register('fn-dataset', FNDatasetViewSet, basename='fn-dataset')
router.register('augmented-dataset', AugmentedDatasetViewSet,
                basename='augmented-dataset')
router.register('user-info', UserInfoViewSet, basename='user-info')
router.register('project-info', ProjectsInfoViewSet, basename='project-info')
router.register('bug-report', BugReportViewSet, basename='bug-report')
router.register('feedback', FeedbackViewSet, basename='feedback')
router.register('message', MessageViewSet, basename='message')
router.register('user', UserViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),
]
