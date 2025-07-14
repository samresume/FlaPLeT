import os
import pickle
import numpy as np
import random
import json
import time
from datetime import datetime
from collections import Counter
from imblearn.over_sampling import SMOTE
from solarflare.models import AugmentedDataset, File, ResultFile


def sizify(value):
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


def da(id):
    try:
        path = r"C:/Users/eskan/CI/backend/datasets"
        result_path = r"C:/Users/eskan/CI/backend/file_results"
        path_w = r"C:/Users/eskan/CI/backend"
        os.makedirs(result_path, exist_ok=True)

        dataset = AugmentedDataset.objects.get(id=id)
        original = dataset.dataset

        # Start timer
        start_time = time.time()

        # Load original files
        with open(path_w + original.x_train.data.url, 'rb') as f:
            x = pickle.load(f)
        with open(path_w + original.y_train.data.url, 'rb') as f:
            y = pickle.load(f)

        x = np.array(x)
        y = np.array(y)

        summary = {
            'original_shape': list(x.shape),
            'label_distribution_before': dict(Counter(y.tolist()))
        }

        if x.ndim == 3:
            num_samples, num_attributes, num_timestamps = x.shape
            x = x.reshape((num_samples, -1))  # Flatten for SMOTE
        else:
            num_attributes = 1
            num_timestamps = x.shape[-1]

        if dataset.data_augmentation == 'smote':
            sm = SMOTE(k_neighbors=dataset.k_neighbors or 5)
            x_aug, y_aug = sm.fit_resample(x, y)

            x_aug = np.array(x_aug)
            y_aug = np.array(y_aug)

            if num_attributes > 1:
                x_aug = x_aug.reshape((-1, num_attributes, num_timestamps))
            else:
                x_aug = x_aug.reshape((-1, num_timestamps))

            # Shuffle
            indices = list(range(len(x_aug)))
            random.shuffle(indices)
            x_aug = x_aug[indices]
            y_aug = y_aug[indices]

            summary['augmented_shape'] = list(x_aug.shape)
            summary['label_distribution_after'] = dict(Counter(y_aug.tolist()))
            summary['augmentation'] = 'SMOTE'
            summary['duration'] = round(time.time() - start_time, 2)

            # Save new files
            now = datetime.now().strftime('%Y%m%d_%H%M%S')
            x_filename = f'aug_x_train_{now}.pkl'
            y_filename = f'aug_y_train_{now}.pkl'

            x_path = os.path.join(path, x_filename)
            y_path = os.path.join(path, y_filename)

            with open(x_path, 'wb') as f:
                pickle.dump(x_aug, f)
            with open(y_path, 'wb') as f:
                pickle.dump(y_aug, f)

            x_file = File.objects.create(
                data='datasets/' + x_filename,
                name=x_filename,
                volume=sizify(os.path.getsize(x_path))
            )
            y_file = File.objects.create(
                data='datasets/' + y_filename,
                name=y_filename,
                volume=sizify(os.path.getsize(y_path))
            )

            # Save summary
            summary_filename = f'summary_{now}.json'
            summary_path = os.path.join(result_path, summary_filename)
            with open(summary_path, 'w') as f:
                json.dump(summary, f, indent=2)

            result_file = ResultFile.objects.create(
                data='file_results/' + summary_filename,
                name=summary_filename
            )

            # Delete old files safely
            if dataset.x_train and dataset.x_train.data:
                x_path_old = dataset.x_train.data.path
                if os.path.isfile(x_path_old):
                    os.remove(x_path_old)
                dataset.x_train.delete()

            if dataset.y_train and dataset.y_train.data:
                y_path_old = dataset.y_train.data.path
                if os.path.isfile(y_path_old):
                    os.remove(y_path_old)
                dataset.y_train.delete()

            if dataset.result_file and dataset.result_file.data:
                res_path_old = dataset.result_file.data.path
                if os.path.isfile(res_path_old):
                    os.remove(res_path_old)
                dataset.result_file.delete()

            # Update model
            dataset.x_train = x_file
            dataset.y_train = y_file
            dataset.result_file = result_file
            dataset.status = 'completed'
            dataset.report_datetime = datetime.now()
            dataset.save()

        elif dataset.data_augmentation == 'timegan':
            # Placeholder for future TimeGAN
            pass

    except Exception as e:
        # Handle error and create error summary
        now = datetime.now().strftime('%Y%m%d_%H%M%S')
        error_summary = {
            'error': str(e),
            'duration': round(time.time() - start_time, 2)
        }
        error_filename = f'error_summary_{now}.json'
        error_path = os.path.join(result_path, error_filename)
        with open(error_path, 'w') as f:
            json.dump(error_summary, f, indent=2)

        result_file = ResultFile.objects.create(
            data='file_results/' + error_filename,
            name=error_filename
        )

        dataset.result_file = result_file
        dataset.status = 'failed'
        dataset.report_datetime = datetime.now()
        dataset.save()

        print(f'[Data Augmentation ERROR] {str(e)}')
