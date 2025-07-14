from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.


class Message(models.Model):
    TYPE = (
        ('update', 'Update'),
        ('issue', 'Issue'),
    )
    URGENT = (
        (1, 'Yes'),
        (0, 'No')
    )

    type = models.CharField(null=True, blank=True, max_length=32, choices=TYPE)
    title = models.CharField(null=True, blank=True, max_length=64)
    description = models.TextField(null=True, blank=True)
    urgent = models.IntegerField(null=True, blank=True, choices=URGENT)
    datetime = models.DateTimeField(auto_now_add=True)


class UserInfo(models.Model):
    TYPE = (
        ('personal', 'Personal'),
        ('organization', 'Organization'),
        ('school', 'School')
    )
    ACCESS = (
        (1, 'Yes'),
        (0, 'No')
    )
    COUNTRY = (
        ('unitedstates', 'United States'),
        ('canada', 'Canada')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(null=True, blank=True, max_length=32, choices=TYPE)
    name = models.CharField(null=True, blank=True, max_length=64)
    email = models.EmailField(null=False, max_length=64)
    phone = models.CharField(null=True, blank=True, max_length=16)
    country = models.CharField(
        null=True, blank=True, max_length=32, choices=COUNTRY)
    access = models.IntegerField(null=True, blank=True, choices=ACCESS)

    class Meta:
        unique_together = (('user', 'email'),)
        index_together = (('user', 'email'),)


class BugFile(models.Model):

    data = models.FileField(null=True, blank=True, upload_to='bugreport/')


class Feedback(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(null=True, blank=True, max_length=64)
    description = models.TextField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True, validators=(
        [MinValueValidator(1), MaxValueValidator(5)]))
    datetime = models.DateTimeField(auto_now_add=True)


class BugReport(models.Model):
    TYPE = (
        ('ui', 'User Interface'),
        ('server', 'Server'),
        ('security', 'Security'),
        ('programing', 'Programing'),
    )
    URGENT = (
        (1, 'Yes'),
        (0, 'No')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(null=True, blank=True, max_length=32, choices=TYPE)
    title = models.CharField(null=True, blank=True, max_length=64)
    description = models.TextField(null=True, blank=True)
    urgent = models.IntegerField(null=True, blank=True, choices=URGENT)
    data = models.ForeignKey(
        BugFile, null=True, blank=True, on_delete=models.CASCADE)
    datetime = models.DateTimeField(auto_now_add=True)


class ResultFile(models.Model):
    data = models.FileField(null=True, blank=True, upload_to='results/')
    name = models.CharField(null=True, blank=True, max_length=64)


class ProjectInfo(models.Model):
    TASK = (
        ('supervised', 'Supervised'),
        ('unsupervised', 'Unsupervised'),
    )
    LEARNING_TYPE = (
        ('classification', 'Classification'),
        ('regression', 'Regression'),
        ('clustering', 'Clustering')
    )
    ML_MODEL = (
        ('gru', 'GRU'),
        ('node2vec', 'Node2Vec'),
        ('svm', 'SVM'),
    )
    OPTIMIZATION = (
        ('adam', 'Adam'),
        ('sgd', 'SGD')
    )
    SVM_KERNEL = (
        ('linear', 'Linear'),
        ('rbf', 'RBF'),
        ('poly', 'Polynomial'),
        ('sigmoid', 'Sigmoid')
    )
    REGULARIZATION = (
        ('l2', 'L2'),
        ('l1', 'L1'),
        ('none', 'None')
    )
    SOLVERS = (
        ('lbfgs', 'L-BFGS'),
        ('liblinear', 'LibLinear'),
        ('sag', 'SAG'),
        ('saga', 'SAGA')
    )

    # General fields
    task = models.CharField(null=False, max_length=32, choices=TASK)
    learning_type = models.CharField(
        null=False, max_length=32, choices=LEARNING_TYPE)
    ml_model = models.CharField(null=False, max_length=32, choices=ML_MODEL)
    train_split = models.IntegerField(null=True, blank=True, validators=[
                                      MinValueValidator(50), MaxValueValidator(90)])

    # GRU and neural network models
    num_layers = models.IntegerField(null=True, blank=True, validators=[
                                     MinValueValidator(1), MaxValueValidator(20)])
    dropout_rate = models.FloatField(null=True, blank=True, validators=[
                                     MinValueValidator(0.0), MaxValueValidator(1.0)])
    batch_size = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    hidden_size = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    learning_rate = models.FloatField(null=True, blank=True, validators=[
                                      MinValueValidator(0.0), MaxValueValidator(1.0)])
    optimization = models.CharField(
        null=True, blank=True, max_length=32, choices=OPTIMIZATION)
    epochs = models.IntegerField(null=True, blank=True, validators=[
                                 MinValueValidator(1), MaxValueValidator(20)])

    # SVM-specific fields
    kernel = models.CharField(null=True, blank=True,
                              max_length=32, choices=SVM_KERNEL)
    regularization_strength = models.FloatField(
        null=True, blank=True, validators=[MinValueValidator(0.0)])

    # Node2Vec-specific fields
    dimensions = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    walk_length = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    num_walks = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    window_size = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    batch_word = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])
    penalty = models.CharField(
        null=True, blank=True, max_length=16, choices=REGULARIZATION)
    solver = models.CharField(null=True, blank=True,
                              max_length=32, choices=SOLVERS)
    max_iter = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)])


class File(models.Model):

    data = models.FileField(null=True, blank=True, upload_to='datasets/')
    name = models.CharField(null=True, blank=True, max_length=64)
    volume = models.CharField(null=True, blank=True, max_length=64)


class Dataset(models.Model):
    NORMALIZATION = (
        ('zscore', 'Z-Score'),
        ('minmax', 'Min-Max'),
        ('none', 'No Normalization')
    )

    MISSING_VALUE = (
        ('mean', 'Mean Imputation'),
        ('remove', 'Remove Missing Samples')
    )

    STATUS = (
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dataset_name = models.CharField(null=False, max_length=64)
    description = models.TextField(null=True, blank=True)

    missing_value = models.CharField(
        null=False, max_length=32, choices=MISSING_VALUE)
    normalization = models.CharField(
        null=True, blank=True, max_length=32, choices=NORMALIZATION)

    status = models.CharField(null=False, blank=True,
                              max_length=32, choices=STATUS)

    x_train = models.ForeignKey(
        File, related_name='x_train_file', null=True, blank=True, on_delete=models.SET_NULL)
    y_train = models.ForeignKey(
        File, related_name='y_train_file', null=True, blank=True, on_delete=models.SET_NULL)

    result_file = models.ForeignKey(
        ResultFile, null=True, blank=True, on_delete=models.SET_NULL)

    datetime = models.DateTimeField(auto_now_add=True)
    report_datetime = models.DateTimeField(auto_now=True)


class AugmentedDataset(models.Model):
    STATUS = (
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    )

    DATAAUGMENTATION = (
        ('smote', 'SMOTE'),
        ('timegan', 'TimeGAN'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dataset_name = models.CharField(null=False, max_length=64)
    description = models.TextField(null=True, blank=True)

    dataset = models.ForeignKey(
        Dataset, null=True, blank=True, on_delete=models.SET_NULL
    )

    data_augmentation = models.CharField(
        null=True, blank=True, max_length=32, choices=DATAAUGMENTATION
    )

    # Replace `data` field with individual files
    x_train = models.ForeignKey(
        File, related_name='aug_x_train_file', null=True, blank=True, on_delete=models.SET_NULL)
    y_train = models.ForeignKey(
        File, related_name='aug_y_train_file', null=True, blank=True, on_delete=models.SET_NULL)

    # Hyperparameters
    k_neighbors = models.IntegerField(null=True, blank=True)  # for SMOTE

    batch_size = models.IntegerField(null=True, blank=True)   # for TimeGAN
    iteration = models.IntegerField(null=True, blank=True)
    num_layers = models.IntegerField(null=True, blank=True)

    result_file = models.ForeignKey(
        ResultFile, null=True, blank=True, on_delete=models.SET_NULL)

    status = models.CharField(null=False, max_length=32, choices=STATUS)
    datetime = models.DateTimeField(auto_now_add=True)
    report_datetime = models.DateTimeField(auto_now=True)


class FNDataset(models.Model):
    STATUS = (
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dataset_name = models.CharField(null=False, max_length=64)
    description = models.TextField(null=True, blank=True)

    mvts_dataset = models.ForeignKey(
        Dataset, null=True, blank=True, on_delete=models.SET_NULL
    )
    aug_dataset = models.ForeignKey(
        AugmentedDataset, null=True, blank=True, on_delete=models.SET_NULL
    )

    x_train = models.ForeignKey(
        File, related_name='fn_x_train_file', null=True, blank=True, on_delete=models.SET_NULL)
    y_train = models.ForeignKey(
        File, related_name='fn_y_train_file', null=True, blank=True, on_delete=models.SET_NULL)

    max_neighbor = models.IntegerField(null=True, blank=True)

    pearson = models.FloatField(
        null=True, blank=True,
        validators=([MinValueValidator(-1.0), MaxValueValidator(1.0)])
    )

    result_file = models.ForeignKey(
        ResultFile, null=True, blank=True, on_delete=models.SET_NULL)

    status = models.CharField(null=False, max_length=32, choices=STATUS)
    datetime = models.DateTimeField(auto_now_add=True)
    report_datetime = models.DateTimeField(auto_now=True)


class Project(models.Model):
    STATUS = (
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project_name = models.CharField(null=False, max_length=64)
    description = models.TextField(null=True, blank=True)

    status = models.CharField(null=False, max_length=32, choices=STATUS)

    datetime = models.DateTimeField(auto_now_add=True)
    report_datetime = models.DateTimeField(auto_now=True)

    # Removed: dataset_type, project_result

    data_info = models.ForeignKey(
        Dataset, null=True, blank=True, on_delete=models.SET_NULL
    )
    fn_data_info = models.ForeignKey(
        FNDataset, null=True, blank=True, on_delete=models.SET_NULL
    )
    data_aug_info = models.ForeignKey(
        AugmentedDataset, null=True, blank=True, on_delete=models.SET_NULL
    )
    project_info = models.ForeignKey(
        ProjectInfo, null=True, blank=True, on_delete=models.CASCADE
    )

    result_file = models.ForeignKey(
        ResultFile, null=True, blank=True, on_delete=models.SET_NULL, related_name='result_projects'
    )
    model_file = models.ForeignKey(
        ResultFile, null=True, blank=True, on_delete=models.SET_NULL, related_name='model_projects'
    )
