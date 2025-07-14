from django.contrib import admin
from .models import (
    Message, UserInfo, BugFile, Feedback, BugReport,
    ResultFile, ProjectInfo, File, Dataset,
    AugmentedDataset, FNDataset, Project
)
import os


# Optional: Show file size in admin list view
def file_size(obj):
    if obj.data and obj.data.path:
        size = os.path.getsize(obj.data.path)
        return f"{size / 1024:.2f} KB"
    return "N/A"


file_size.short_description = "File Size (KB)"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_name', 'user', 'status', 'datetime']
    list_display_links = ['project_name']
    list_filter = ['status', 'datetime']
    search_fields = ['project_name', 'user__username']
    readonly_fields = ['datetime', 'report_datetime']
    autocomplete_fields = ['user', 'data_info',
                           'fn_data_info', 'data_aug_info']  # optional
    fieldsets = (
        ('Basic Info', {'fields': ('project_name',
         'user', 'description', 'status')}),
        ('Data Source', {
         'fields': ('data_info', 'fn_data_info', 'data_aug_info')}),
        ('Configuration', {'fields': ('project_info',)}),
        ('Result', {'fields': ('result_file',)}),
        ('Model', {'fields': ('model_file',)}),
        ('Timestamps', {'fields': ('datetime', 'report_datetime')}),
    )


@admin.register(ProjectInfo)
class ProjectInfoAdmin(admin.ModelAdmin):
    list_display = ['ml_model', 'task', 'learning_type', 'optimization']
    list_filter = ['ml_model', 'task', 'learning_type']
    search_fields = ['ml_model']
    fieldsets = (
        ('General Settings', {
         'fields': ('task', 'learning_type', 'ml_model')}),
        ('Neural Network Params', {
            'fields': ('num_layers', 'dropout_rate', 'batch_size', 'hidden_size',
                       'learning_rate', 'optimization', 'epochs', 'train_split'),
            'classes': ['collapse']
        }),
        ('SVM Params', {
            'fields': ('kernel', 'regularization_strength'),
            'classes': ['collapse']
        }),
        ('Node2Vec Params', {
            'fields': ('dimensions', 'walk_length', 'num_walks', 'window_size',
                       'batch_word', 'penalty', 'solver', 'max_iter'),
            'classes': ['collapse']
        }),
    )


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ['dataset_name', 'user', 'status',
                    'normalization', 'missing_value', 'datetime']
    list_filter = ['status', 'normalization', 'missing_value']
    search_fields = ['dataset_name', 'user__username']
    readonly_fields = ['datetime', 'report_datetime']
    autocomplete_fields = ['user']


@admin.register(AugmentedDataset)
class AugmentedDatasetAdmin(admin.ModelAdmin):
    list_display = ['dataset_name', 'data_augmentation', 'status', 'datetime']
    list_filter = ['data_augmentation', 'status']
    search_fields = ['dataset_name']
    readonly_fields = ['datetime', 'report_datetime']
    autocomplete_fields = ['user', 'dataset']


@admin.register(FNDataset)
class FNDatasetAdmin(admin.ModelAdmin):
    list_display = ['dataset_name', 'status', 'pearson', 'datetime']
    list_filter = ['status']
    search_fields = ['dataset_name']
    readonly_fields = ['datetime', 'report_datetime']
    autocomplete_fields = ['user', 'mvts_dataset', 'aug_dataset']


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ['name', 'data', 'volume', file_size]
    search_fields = ['name']


@admin.register(ResultFile)
class ResultFileAdmin(admin.ModelAdmin):
    list_display = ['name', 'data', file_size]
    search_fields = ['name']


@admin.register(UserInfo)
class UserInfoAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'country', 'type']
    list_filter = ['type', 'country']
    search_fields = ['name', 'email']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'urgent', 'datetime']
    list_filter = ['type', 'urgent']
    search_fields = ['title']


@admin.register(BugFile)
class BugFileAdmin(admin.ModelAdmin):
    list_display = ['data']


@admin.register(BugReport)
class BugReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'urgent', 'datetime']
    list_filter = ['type', 'urgent']
    search_fields = ['title']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['title', 'score', 'datetime']
    list_filter = ['score']
    search_fields = ['title']
