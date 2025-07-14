from rest_framework import serializers
from .models import (
    Project, ProjectInfo, UserInfo, Dataset, File, Message,
    BugFile, BugReport, Feedback, FNDataset, AugmentedDataset, ResultFile
)
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'


class ResultFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultFile
        fields = '__all__'


class BugFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BugFile
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ('id', 'title', 'description', 'score', 'datetime')


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'title', 'description', 'type', 'urgent', 'datetime')


class BugReportSerializer(serializers.ModelSerializer):
    data = BugFileSerializer(many=False)

    class Meta:
        model = BugReport
        fields = ('id', 'title', 'description',
                  'type', 'urgent', 'data', 'datetime')


class DatasetSerializer(serializers.ModelSerializer):
    x_train = FileSerializer()
    y_train = FileSerializer()
    result_file = ResultFileSerializer()

    class Meta:
        model = Dataset
        fields = (
            'id', 'dataset_name', 'description', 'missing_value', 'normalization',
            'x_train', 'y_train', 'status', 'datetime', 'report_datetime', 'result_file'
        )


class AugmentedDatasetSerializer(serializers.ModelSerializer):
    dataset = DatasetSerializer()
    x_train = FileSerializer()
    y_train = FileSerializer()
    result_file = ResultFileSerializer()

    class Meta:
        model = AugmentedDataset
        fields = (
            'id', 'dataset_name', 'description', 'dataset', 'data_augmentation', 'status',
            'x_train', 'y_train', 'k_neighbors', 'batch_size', 'iteration', 'num_layers',
            'result_file', 'datetime', 'report_datetime'
        )


class FNDatasetSerializer(serializers.ModelSerializer):
    mvts_dataset = DatasetSerializer()
    aug_dataset = AugmentedDatasetSerializer()
    x_train = FileSerializer()
    y_train = FileSerializer()
    result_file = ResultFileSerializer()

    class Meta:
        model = FNDataset
        fields = (
            'id', 'dataset_name', 'description', 'mvts_dataset', 'aug_dataset',
            'x_train', 'y_train', 'max_neighbor', 'pearson', 'status',
            'datetime', 'report_datetime', 'result_file'
        )


class ProjectInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInfo
        fields = (
            'id', 'task', 'learning_type', 'ml_model',
            'learning_rate', 'optimization', 'num_layers', 'dropout_rate',
            'batch_size', 'hidden_size', 'epochs', 'train_split',
            'kernel', 'regularization_strength',
            'dimensions', 'walk_length', 'num_walks', 'window_size',
            'batch_word', 'penalty', 'solver', 'max_iter'
        )


class ProjectSerializer(serializers.ModelSerializer):
    project_info = ProjectInfoSerializer()
    data_info = DatasetSerializer()
    fn_data_info = FNDatasetSerializer()
    data_aug_info = AugmentedDatasetSerializer()
    result_file = ResultFileSerializer()
    model_file = ResultFileSerializer()

    class Meta:
        model = Project
        fields = (
            'id', 'user', 'project_name', 'description', 'status',
            'datetime', 'report_datetime',
            'data_info', 'fn_data_info', 'data_aug_info',
            'project_info', 'result_file', 'model_file'
        )


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = (
            'id', 'user', 'type', 'name', 'email',
            'country', 'phone', 'access'
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password',)
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        return user
