
from solarflare.serializers import ProjectSerializer
from solarflare.models import Project, ProjectInfo, Dataset, AugmentedDataset, FNDataset, ResultFile
from solarflare.serializers import FNDatasetSerializer
from solarflare.models import FNDataset, Dataset, AugmentedDataset, File, ResultFile
from solarflare.serializers import AugmentedDatasetSerializer
from solarflare.models import AugmentedDataset, Dataset, File, ResultFile
import random
from rest_framework import status, viewsets
from django.core.files.storage import FileSystemStorage
from rest_framework import status
from django.http import HttpResponse
from wsgiref.util import FileWrapper
from rest_framework.decorators import action
from .models import Project, ProjectInfo, UserInfo, Dataset, File, Message, Feedback, BugFile, BugReport, \
    FNDataset, AugmentedDataset, ResultFile
from rest_framework import viewsets
from .serializers import ProjectSerializer, ProjectInfoSerializer, UserInfoSerializer, UserSerializer, DatasetSerializer, FileSerializer, MessageSerializer, FeedbackSerializer, BugFileSerializer, BugReportSerializer, \
    AugmentedDatasetSerializer, FNDatasetSerializer, ResultFileSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .celeryTask import celeryTask
import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
import os
import environ
from django.core.files import File as DjangoFile


env = environ.Env()
environ.Env.read_env()

RECAPTCHA_SECRET = env("RECAPTCHA_SECRET")


@api_view(['POST'])
def recaptcha(request):
    r = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={
            'secret': RECAPTCHA_SECRET,
            'response': request.data['captcha_value'],
        }
    )

    return Response({'captcha': r.json()})


def sizify(value):

    # value = ing(value)
    if value < 512000:
        value = value / 1024.0
        ext = 'KB'
    elif value < 4194304000:
        value = value / 1048576.0
        ext = 'MB'
    else:
        value = value / 1073741824.0
        ext = 'GB'
    return '%s %s' % (str(round(value, 2)), ext)

# _______________________________________________________________________


class ProjectsViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_projects(self, request):
        user = request.user
        projects = Project.objects.filter(user=user)
        serializer = ProjectSerializer(projects, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def delete_project(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'message': 'failure', 'error': 'Missing project_id'}, status=400)

        try:
            user = request.user
            project = Project.objects.get(user=user, id=project_id)

            # Delete associated result file from disk
            if project.result_file and project.result_file.data:
                result_path = project.result_file.data.path
                if os.path.isfile(result_path):
                    os.remove(result_path)
                project.result_file.delete()

            if project.model_file and project.model_file.data:
                model_path = project.model_file.data.path
                if os.path.isfile(model_path):
                    os.remove(model_path)
                project.model_file.delete()

            if project.project_info:
                project.project_info.delete()

            project.delete()

            projects = Project.objects.filter(user=user)
            serializer = ProjectSerializer(projects, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def set_project(self, request):
        required_fields = ['project_name', 'task',
                           'learning_type', 'ml_model', 'dataset', 'data_id']
        if not all(field in request.data for field in required_fields):
            return Response({'message': 'failure', 'error': 'Missing required fields'}, status=400)

        try:
            user = request.user
            project_name = request.data['project_name']
            task = request.data['task']
            learning_type = request.data['learning_type']
            ml_model = request.data['ml_model']
            dataset_type = request.data['dataset']
            data_id = request.data['data_id']
            description = request.data.get('description', '')

            # Optional hyperparameters
            def parse_int(key): return int(
                request.data[key]) if request.data.get(key) else None
            def parse_float(key): return float(
                request.data[key]) if request.data.get(key) else None

            project_info = ProjectInfo.objects.create(
                task=task,
                learning_type=learning_type,
                ml_model=ml_model,
                learning_rate=parse_float('learning_rate'),
                optimization=request.data.get('optimization'),
                num_layers=parse_int('num_layers'),
                dropout_rate=parse_float('dropout_rate'),
                batch_size=parse_int('batch_size'),
                hidden_size=parse_int('hidden_size'),
                epochs=parse_int('epochs'),
                train_split=parse_int('train_split'),
                kernel=request.data.get('kernel'),
                regularization_strength=parse_float('regularization_strength'),
                dimensions=parse_int('dimensions'),
                walk_length=parse_int('walk_length'),
                num_walks=parse_int('num_walks'),
                window_size=parse_int('window_size'),
                batch_word=parse_int('batch_word'),
                penalty=request.data.get('penalty'),
                solver=request.data.get('solver'),
                max_iter=parse_int('max_iter')
            )

            # Attach dataset
            project = None
            if dataset_type == 'dataset':
                data_info = Dataset.objects.get(user=user, id=data_id)
                project = Project.objects.create(
                    user=user,
                    project_name=project_name,
                    description=description,
                    status='running',
                    project_info=project_info,
                    data_info=data_info
                )
            elif dataset_type == 'fn_dataset':
                fn_data_info = FNDataset.objects.get(user=user, id=data_id)
                project = Project.objects.create(
                    user=user,
                    project_name=project_name,
                    description=description,
                    status='running',
                    project_info=project_info,
                    fn_data_info=fn_data_info
                )
            elif dataset_type == 'augmented_dataset':
                data_aug_info = AugmentedDataset.objects.get(
                    user=user, id=data_id)
                project = Project.objects.create(
                    user=user,
                    project_name=project_name,
                    description=description,
                    status='running',
                    project_info=project_info,
                    data_aug_info=data_aug_info
                )
            else:
                return Response({'message': 'failure', 'error': 'Invalid dataset type'}, status=400)

            celeryTask.delay(id=project.id, type='ml')

            projects = Project.objects.filter(user=user)
            serializer = ProjectSerializer(projects, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    @action(detail=False, methods=['POST'])
    def get_file(self, request):
        project_id = request.data.get('project_id')
        which = request.data.get('which')  # 'result' or 'model'

        if not project_id or not which:
            return Response({'message': 'failure', 'error': 'Missing project_id or which'}, status=400)

        try:
            project = Project.objects.get(id=project_id)

            file_obj = None
            if which == 'result':
                file_obj = project.result_file
            elif which == 'model':
                file_obj = project.model_file
            else:
                return Response({'message': 'failure', 'error': 'Invalid file type'}, status=400)

            if file_obj and file_obj.data:
                file_path = file_obj.data.path
                file_name = file_obj.name
                file_ext = file_name.split('.')[-1]

                document = open(file_path, 'rb')
                response = HttpResponse(FileWrapper(
                    document), content_type=f'application/{file_ext}')
                response['Content-Disposition'] = f'attachment; filename="{file_name}"'
                return response

            return Response({'message': 'failure', 'error': 'File not found'}, status=400)

        except Project.DoesNotExist:
            return Response({'message': 'failure', 'error': 'Project not found'}, status=404)
        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    def create(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=400)

    def retrieve(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=400)

    def update(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=400)

    def destroy(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=400)

    def list(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=400)


# _______________________________________________________________________

class ProjectsInfoViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['POST'])
    def get_info(self, request):
        projectinfo_id = request.data.get('projectinfo_id')
        if not projectinfo_id:
            return Response({'message': 'failure', 'data': ''}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project_info = ProjectInfo.objects.get(id=projectinfo_id)
            serializer = ProjectsInfoSerializer(project_info, many=False)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
        except ProjectInfo.DoesNotExist:
            return Response({'message': 'failure', 'data': ''}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# _______________________________________________________________________


class DatasetViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        user = request.user
        datasets = Dataset.objects.filter(user=user)
        serializer = DatasetSerializer(datasets, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    import os

    @action(detail=False, methods=['POST'])
    def delete_dataset(self, request):
        dataset_id = request.data.get('dataset_id')
        if not dataset_id:
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            dataset = Dataset.objects.get(user=request.user, id=dataset_id)

            # Delete x_train file from disk
            if dataset.x_train and dataset.x_train.data:
                x_path = dataset.x_train.data.path
                if os.path.isfile(x_path):
                    os.remove(x_path)
                dataset.x_train.delete()

            # Delete y_train file from disk
            if dataset.y_train and dataset.y_train.data:
                y_path = dataset.y_train.data.path
                if os.path.isfile(y_path):
                    os.remove(y_path)
                dataset.y_train.delete()

            # Delete result_file from disk
            if dataset.result_file and dataset.result_file.data:
                res_path = dataset.result_file.data.path
                if os.path.isfile(res_path):
                    os.remove(res_path)
                dataset.result_file.delete()

            dataset.delete()

            datasets = Dataset.objects.filter(user=request.user)
            serializer = DatasetSerializer(datasets, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def set_info(self, request):
        user = request.user

        base_path = 'C:/Users/eskan/CI/backend/'

        # Required fields check
        dataset_name = request.data.get('dataset_name')
        missing_value = request.data.get('missing_value')
        normalization = request.data.get('normalization')
        description = request.data.get('description', '')

        x_file = request.FILES.get('file0')
        y_file = request.FILES.get('file1')

        if not all([dataset_name, missing_value, normalization is not None, x_file, y_file]):
            return Response({'message': 'failure', 'error': 'All fields are required.'}, status=400)

        # File format check
        if not x_file.name.endswith('.pkl') or not y_file.name.endswith('.pkl'):
            return Response({'message': 'failure', 'error': 'Both files must be in .pkl format.'}, status=400)

        # File size check
        if x_file.size > 20 * 1024 * 1024 or y_file.size > 20 * 1024 * 1024:
            return Response({'message': 'failure', 'error': 'Each file must be less than 20MB.'}, status=400)

        try:

            # Save x_train
            x_file_obj = File.objects.create(data=x_file)
            x_actual_name = os.path.basename(
                x_file_obj.data.name)  # Get stored filename
            x_file_obj.name = x_actual_name
            x_file_obj.volume = sizify(
                os.path.getsize(base_path + x_file_obj.data.url))
            x_file_obj.save()

            # Save y_train
            y_file_obj = File.objects.create(data=y_file)
            y_actual_name = os.path.basename(y_file_obj.data.name)
            y_file_obj.name = y_actual_name
            y_file_obj.volume = sizify(
                os.path.getsize(base_path + y_file_obj.data.url))
            y_file_obj.save()

            # Save dataset
            dataset = Dataset.objects.create(
                user=user,
                dataset_name=dataset_name,
                description=description,
                missing_value=missing_value,
                normalization=normalization,
                x_train=x_file_obj,
                y_train=y_file_obj,
                status='running'
            )

            # Trigger preprocessing task unconditionally
            celeryTask.delay(id=dataset.id, type='pp')

            datasets = Dataset.objects.filter(user=user)
            serializer = DatasetSerializer(datasets, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=200)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    @action(detail=False, methods=['POST'])
    def get_file(self, request):
        dataset_id = request.data.get('dataset_id')
        which = request.data.get('which')  # <-- Added

        if not dataset_id or not which:
            return Response({'message': 'failure', 'error': 'Missing dataset_id or which'}, status=400)

        try:
            dataset = Dataset.objects.get(id=dataset_id)

            file_obj = None
            if which == 'x_train':
                file_obj = dataset.x_train
            elif which == 'y_train':
                file_obj = dataset.y_train
            # Optionally add result_file if you plan to support that
            elif which == 'result':
                file_obj = dataset.result_file

            if file_obj and file_obj.data:
                file_path = file_obj.data.path
                file_name = file_obj.name
                file_ext = file_name.split('.')[-1]

                document = open(file_path, 'rb')
                response = HttpResponse(FileWrapper(
                    document), content_type=f'application/{file_ext}')
                response['Content-Disposition'] = f'attachment; filename="{file_name}"'
                return response

            return Response({'message': 'failure', 'error': 'File not found'}, status=400)

        except Dataset.DoesNotExist:
            return Response({'message': 'failure', 'error': 'Dataset not found'}, status=404)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    # Block unused ModelViewSet methods
    def create(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# _______________________________________________________________________


class FNDatasetViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        user = request.user
        fndatasets = FNDataset.objects.filter(user=user)
        serializer = FNDatasetSerializer(fndatasets, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def delete_dataset(self, request):
        dataset_id = request.data.get('dataset_id')
        if not dataset_id:
            return Response({'message': 'failure', 'error': 'dataset_id required'}, status=400)

        try:
            fndataset = FNDataset.objects.get(user=request.user, id=dataset_id)

            # Delete x_train file
            if fndataset.x_train and fndataset.x_train.data:
                x_path = fndataset.x_train.data.path
                if os.path.isfile(x_path):
                    os.remove(x_path)
                fndataset.x_train.delete()

            # Delete y_train file
            if fndataset.y_train and fndataset.y_train.data:
                y_path = fndataset.y_train.data.path
                if os.path.isfile(y_path):
                    os.remove(y_path)
                fndataset.y_train.delete()

            # Delete result_file
            if fndataset.result_file and fndataset.result_file.data:
                res_path = fndataset.result_file.data.path
                if os.path.isfile(res_path):
                    os.remove(res_path)
                fndataset.result_file.delete()

            fndataset.delete()

            fndatasets = FNDataset.objects.filter(user=request.user)
            serializer = FNDatasetSerializer(fndatasets, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    @action(detail=False, methods=['POST'])
    def set_info(self, request):
        user = request.user
        dataset_name = request.data.get('dataset_name')
        dataset_id = request.data.get('dataset_id')
        # should be 'dataset' or 'augmented_dataset'
        dataset_type = request.data.get('dataset')
        description = request.data.get('description', '')
        pearson = request.data.get('pearson')
        pearson = float(pearson) if pearson else None
        max_neighbor = request.data.get('max_neighbor')
        max_neighbor = int(max_neighbor) if max_neighbor else None

        if not all([dataset_name, dataset_id, dataset_type]):
            return Response({'message': 'failure', 'error': 'Required fields missing.'}, status=400)

        try:
            if dataset_type == 'dataset':
                mvts_dataset = Dataset.objects.get(user=user, id=dataset_id)
                fndataset = FNDataset.objects.create(
                    user=user,
                    dataset_name=dataset_name,
                    description=description,
                    mvts_dataset=mvts_dataset,
                    status='running',
                    pearson=pearson,
                    max_neighbor=max_neighbor
                )
            elif dataset_type == 'augmented_dataset':
                aug_dataset = AugmentedDataset.objects.get(
                    user=user, id=dataset_id)
                fndataset = FNDataset.objects.create(
                    user=user,
                    dataset_name=dataset_name,
                    description=description,
                    aug_dataset=aug_dataset,
                    status='running',
                    pearson=pearson,
                    max_neighbor=max_neighbor
                )
            else:
                return Response({'message': 'failure', 'error': 'Invalid dataset_type'}, status=400)

            # Launch graph generation task
            celeryTask.delay(id=fndataset.id, type='gg')

            fndatasets = FNDataset.objects.filter(user=user)
            serializer = FNDatasetSerializer(fndatasets, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    @action(detail=False, methods=['POST'])
    def get_file(self, request):
        dataset_id = request.data.get('dataset_id')
        which = request.data.get('which')

        if not dataset_id or not which:
            return Response({'message': 'failure', 'error': 'Missing dataset_id or which'}, status=400)

        try:
            dataset = FNDataset.objects.get(id=dataset_id)

            file_obj = None
            if which == 'x_train':
                file_obj = dataset.x_train
            elif which == 'y_train':
                file_obj = dataset.y_train
            elif which == 'result':
                file_obj = dataset.result_file

            if file_obj and file_obj.data:
                file_path = file_obj.data.path
                file_name = file_obj.name
                file_ext = file_name.split('.')[-1]

                document = open(file_path, 'rb')
                response = HttpResponse(FileWrapper(
                    document), content_type=f'application/{file_ext}')
                response['Content-Disposition'] = f'attachment; filename="{file_name}"'
                return response

            return Response({'message': 'failure', 'error': 'File not found'}, status=400)

        except FNDataset.DoesNotExist:
            return Response({'message': 'failure', 'error': 'FNDataset not found'}, status=404)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    # Block unused ViewSet methods
    def create(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# _______________________________________________________________________


class AugmentedDatasetViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        user = request.user
        datasets = AugmentedDataset.objects.filter(user=user)
        serializer = AugmentedDatasetSerializer(datasets, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def delete_dataset(self, request):
        dataset_id = request.data.get('dataset_id')
        if not dataset_id:
            return Response({'message': 'failure', 'error': 'dataset_id required'}, status=400)

        try:
            dataset = AugmentedDataset.objects.get(
                user=request.user, id=dataset_id)

            # Delete x_train file
            if dataset.x_train and dataset.x_train.data:
                x_path = dataset.x_train.data.path
                if os.path.isfile(x_path):
                    os.remove(x_path)
                dataset.x_train.delete()

            # Delete y_train file
            if dataset.y_train and dataset.y_train.data:
                y_path = dataset.y_train.data.path
                if os.path.isfile(y_path):
                    os.remove(y_path)
                dataset.y_train.delete()

            # Delete result file
            if dataset.result_file and dataset.result_file.data:
                res_path = dataset.result_file.data.path
                if os.path.isfile(res_path):
                    os.remove(res_path)
                dataset.result_file.delete()

            dataset.delete()

            datasets = AugmentedDataset.objects.filter(user=request.user)
            serializer = AugmentedDatasetSerializer(datasets, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    @action(detail=False, methods=['POST'])
    def set_info(self, request):
        user = request.user
        dataset_name = request.data.get('dataset_name')
        dataset_id = request.data.get('dataset_id')
        data_augmentation = request.data.get('data_augmentation')
        description = request.data.get('description', '')

        if not all([dataset_name, dataset_id, data_augmentation]):
            return Response({'message': 'failure', 'error': 'Required fields missing.'}, status=400)

        # Extract hyperparameters conditionally
        k_neighbors = request.data.get('k_neighbors')
        batch_size = request.data.get('batch_size')
        iteration = request.data.get('iteration')
        num_layers = request.data.get('num_layers')

        try:
            dataset = Dataset.objects.get(user=user, id=dataset_id)

            # Build kwargs for creation
            create_kwargs = {
                'user': user,
                'dataset_name': dataset_name,
                'description': description,
                'dataset': dataset,
                'data_augmentation': data_augmentation,
                'status': 'running',
            }

            # Add hyperparameters based on augmentation type
            if data_augmentation == 'smote':
                if k_neighbors is None:
                    return Response({'message': 'failure', 'error': 'k_neighbors is required for SMOTE.'}, status=400)
                create_kwargs['k_neighbors'] = int(k_neighbors)

            elif data_augmentation == 'timegan':
                if not all([batch_size, iteration, num_layers]):
                    return Response({'message': 'failure', 'error': 'All TimeGAN hyperparameters are required.'}, status=400)
                create_kwargs['batch_size'] = int(batch_size)
                create_kwargs['iteration'] = int(iteration)
                create_kwargs['num_layers'] = int(num_layers)

            augmented_dataset = AugmentedDataset.objects.create(
                **create_kwargs)

            # Trigger augmentation task
            celeryTask.delay(id=augmented_dataset.id, type='da')

            datasets = AugmentedDataset.objects.filter(user=user)
            serializer = AugmentedDatasetSerializer(datasets, many=True)
            return Response({'message': 'success', 'data': serializer.data}, status=200)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    @action(detail=False, methods=['POST'])
    def get_file(self, request):
        dataset_id = request.data.get('dataset_id')
        which = request.data.get('which')

        if not dataset_id or not which:
            return Response({'message': 'failure', 'error': 'Missing dataset_id or which'}, status=400)

        try:
            dataset = AugmentedDataset.objects.get(id=dataset_id)

            file_obj = None
            if which == 'x_train':
                file_obj = dataset.x_train
            elif which == 'y_train':
                file_obj = dataset.y_train
            elif which == 'result':
                file_obj = dataset.result_file

            if file_obj and file_obj.data:
                file_path = file_obj.data.path
                file_name = file_obj.name
                file_ext = file_name.split('.')[-1]

                document = open(file_path, 'rb')
                response = HttpResponse(FileWrapper(
                    document), content_type=f'application/{file_ext}')
                response['Content-Disposition'] = f'attachment; filename="{file_name}"'
                return response

            return Response({'message': 'failure', 'error': 'File not found'}, status=400)

        except AugmentedDataset.DoesNotExist:
            return Response({'message': 'failure', 'error': 'Augmented dataset not found'}, status=404)

        except Exception as e:
            return Response({'message': 'failure', 'error': str(e)}, status=400)

    # Block unused ViewSet methods
    def create(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# _______________________________________________________________________

# ---------------------


class UserInfoViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        try:
            user_info = UserInfo.objects.get(user=request.user)
            serializer = UserInfoSerializer(user_info, many=False)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
        except UserInfo.DoesNotExist:
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def set_info(self, request):
        required_fields = ['type', 'name', 'country', 'phone']
        if all(field in request.data for field in required_fields):
            try:
                user_info = UserInfo.objects.get(user=request.user)

                if request.data['name']:
                    user_info.name = request.data['name']
                if request.data['type']:
                    user_info.type = request.data['type']
                if request.data['country']:
                    user_info.country = request.data['country']
                if request.data['phone']:
                    user_info.phone = request.data['phone']

                user_info.save()

                serializer = UserInfoSerializer(user_info, many=False)
                return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
            except UserInfo.DoesNotExist:
                return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# ---------------------


class BugReportViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        bug_reports = BugReport.objects.filter(
            user=request.user).order_by('-datetime')
        serializer = BugReportSerializer(bug_reports, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def set_info(self, request):
        type_ = request.data.get('type')
        urgent_raw = request.data.get('urgent')
        title = request.data.get('title')
        description = request.data.get('description')
        file = request.FILES.get('file0')

        if not all([type_, urgent_raw, title, description, file]):
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

        urgent = 1 if urgent_raw.lower() == 'true' else 0

        try:
            bug_file = BugFile.objects.create(data=file)
            BugReport.objects.create(
                user=request.user,
                type=type_,
                urgent=urgent,
                title=title,
                description=description,
                data=bug_file
            )
            return Response({'message': 'success'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# ---------------------


class MessageViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        messages = Message.objects.all().order_by('-datetime')
        serializer = MessageSerializer(messages, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    def list(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# ---------------------


class FeedbackViewSet(viewsets.ViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['GET'])
    def get_info(self, request):
        feedbacks = Feedback.objects.filter(user=request.user)
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def set_info(self, request):
        title = request.data.get('title')
        description = request.data.get('description')
        score = request.data.get('score')

        if not (title and description and score):
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            score = int(score)
            Feedback.objects.create(
                user=request.user,
                title=title,
                description=description,
                score=score
            )
            return Response({'message': 'success'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

# ---------------------


class UserViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['POST'])
    def set_user(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        name = request.data.get('name')
        user_type = request.data.get('type')
        country = request.data.get('country')
        phone = request.data.get('phone', '')

        if not username or not password:
            return Response({'message': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'message': 'user already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                username=username, password=password)
            UserInfo.objects.create(
                user=user, email=username, phone=phone, name=name, type=user_type, country=country)

            serializer = UserSerializer(user)
            return Response({'message': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        return Response({'message': 'failure'}, status=status.HTTP_400_BAD_REQUEST)
