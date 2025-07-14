import os
import pickle
import numpy as np
import random
import json
import time
from datetime import datetime
from collections import Counter
from scipy.stats import pearsonr
from solarflare.models import Dataset, File, ResultFile


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


def pp(id):
    try:
        dataset = Dataset.objects.get(id=id)
        path = r"C:/Users/eskan/CI/backend/datasets"
        result_path = r"C:/Users/eskan/CI/backend/file_results"
        path_w = r"C:/Users/eskan/CI/backend"
        result_path_w = r"C:/Users/eskan/CI/backend"
        os.makedirs(result_path, exist_ok=True)

        start_time = time.time()

        # Load x and y
        with open(path_w + dataset.x_train.data.url, 'rb') as f:
            x = pickle.load(f)
        with open(path_w + dataset.y_train.data.url, 'rb') as f:
            y = pickle.load(f)

        x = np.array(x)
        y = np.array(y)

        original_shape = x.shape
        summary = {
            'original_shape': list(original_shape),
            'count_missing': int(np.isnan(x).sum()),
            'label_distribution': dict(Counter(y.tolist())),
        }

        if x.ndim == 2:
            x = np.expand_dims(x, axis=1)

        # Imputation
        if dataset.missing_value == 'remove':
            mask = ~np.isnan(x).any(axis=(1, 2))
            x = x[mask]
            y = y[mask]
        elif dataset.missing_value == 'mean':
            for i in range(x.shape[0]):
                for j in range(x.shape[1]):
                    series = x[i, j, :]
                    mean_val = np.nanmean(series)
                    series[np.isnan(series)] = mean_val
                    x[i, j, :] = series

        # Normalization
        norm_stats = {}
        if dataset.normalization == 'zscore':
            for attr in range(x.shape[1]):
                attr_vals = x[:, attr, :]
                mean = float(np.mean(attr_vals))
                std = float(np.std(attr_vals))
                norm_stats[f'feature_{attr}'] = {'mean': mean, 'std': std}
                if std != 0:
                    x[:, attr, :] = (attr_vals - mean) / std
        elif dataset.normalization == 'minmax':
            for attr in range(x.shape[1]):
                attr_vals = x[:, attr, :]
                min_val = float(np.min(attr_vals))
                max_val = float(np.max(attr_vals))
                norm_stats[f'feature_{attr}'] = {
                    'min': min_val, 'max': max_val}
                if max_val - min_val != 0:
                    x[:, attr, :] = (attr_vals - min_val) / (max_val - min_val)

        summary['normalization_stats'] = norm_stats

        # Correlation between features
        correlations = []
        if x.shape[1] > 1:
            for i in range(x.shape[1]):
                for j in range(i + 1, x.shape[1]):
                    corr, _ = pearsonr(
                        x[:, i, :].flatten(), x[:, j, :].flatten())
                    if abs(corr) > 0.75:
                        correlations.append(
                            {'pair': [i, j], 'correlation': float(corr)})
        summary['correlated_features'] = correlations

        # Shuffle samples
        indices = list(range(len(x)))
        random.shuffle(indices)
        x = x[indices]
        y = y[indices]

        summary['final_shape'] = list(x.shape)
        summary['duration'] = round(time.time() - start_time, 2)

        # Save new .pkl files
        now = datetime.now().strftime('%Y%m%d_%H%M%S')
        x_filename = f'x_train_preprocessed_{now}.pkl'
        y_filename = f'y_train_preprocessed_{now}.pkl'
        x_path = os.path.join(path, x_filename)
        y_path = os.path.join(path, y_filename)

        with open(x_path, 'wb') as f:
            pickle.dump(x, f)
        with open(y_path, 'wb') as f:
            pickle.dump(y, f)

        # Save summary JSON file
        summary_filename = f'summary_{now}.json'
        summary_path = os.path.join(result_path, summary_filename)
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)

        # Create new file records
        x_file = File.objects.create(
            data='datasets/' + x_filename, name=x_filename, volume=sizify(os.path.getsize(x_path)))
        y_file = File.objects.create(
            data='datasets/' + y_filename, name=y_filename, volume=sizify(os.path.getsize(y_path)))
        result_file = ResultFile.objects.create(
            data='file_results/' + summary_filename, name=summary_filename)

        # Cleanup old files
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

        dataset.x_train = x_file
        dataset.y_train = y_file
        dataset.result_file = result_file
        dataset.status = 'completed'
        dataset.report_datetime = datetime.now()
        dataset.save()

    except Exception as e:
        now = datetime.now().strftime('%Y%m%d_%H%M%S')
        error_summary = {
            'error': str(e),
            'duration': round(time.time() - start_time, 2)
        }
        error_filename = f'error_summary_{now}.json'
        error_path = os.path.join(
            r"C:/Users/eskan/CI/backend/file_results", error_filename)
        with open(error_path, 'w') as f:
            json.dump(error_summary, f, indent=2)

        result_file = ResultFile.objects.create(
            data='file_results/' + error_filename, name=error_filename)
        dataset.result_file = result_file
        dataset.status = 'failed'
        dataset.report_datetime = datetime.now()
        dataset.save()
