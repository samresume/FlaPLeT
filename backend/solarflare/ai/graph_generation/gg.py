import os
import pickle
import numpy as np
import networkx as nx
import json
import time
from datetime import datetime
from collections import Counter
from solarflare.models import FNDataset, File, ResultFile


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


def gg(id):
    try:
        path = r"C:/Users/eskan/CI/backend/datasets"
        result_path = r"C:/Users/eskan/CI/backend/file_results"
        path_w = r"C:/Users/eskan/CI/backend"
        os.makedirs(result_path, exist_ok=True)

        dataset = FNDataset.objects.get(id=id)
        src = dataset.mvts_dataset or dataset.aug_dataset
        if not src:
            print('[Graph Generation ERROR] No source dataset attached.')
            return

        start_time = time.time()

        # Load data
        with open(path_w + src.x_train.data.url, 'rb') as f:
            x = pickle.load(f)
        with open(path_w + src.y_train.data.url, 'rb') as f:
            y = pickle.load(f)

        x = np.array(x)
        y = np.array(y)

        original_x_shape = list(x.shape)
        original_y_shape = list(y.shape)

        if x.ndim == 3:
            x = x.reshape(x.shape[0], -1)  # flatten each sample

        num_samples = x.shape[0]
        threshold = dataset.pearson or 0.3
        max_k = dataset.max_neighbor or 5

        # Compute correlation matrix
        corr_matrix = np.corrcoef(x)
        np.fill_diagonal(corr_matrix, 0)

        # Build graph
        G = nx.Graph()
        for i in range(num_samples):
            G.add_node(i, label=int(y[i]))

        for i in range(num_samples):
            abs_corr = np.abs(corr_matrix[i])
            neighbors = np.argsort(abs_corr)[-max_k:]

            for j in neighbors:
                if abs_corr[j] >= threshold:
                    G.add_edge(i, j, weight=float(corr_matrix[i][j]))

        # Summary info (added data shapes here)
        summary = {
            'original_x_shape': original_x_shape,
            'num_nodes': G.number_of_nodes(),
            'num_edges': G.number_of_edges(),
            'label_distribution': dict(Counter(y.tolist())),
            'duration': round(time.time() - start_time, 2)
        }

        # Save files
        now = datetime.now().strftime('%Y%m%d_%H%M%S')
        graph_filename = f'graph_x_train_{now}.gpickle'
        label_filename = f'graph_y_train_{now}.pkl'
        summary_filename = f'graph_summary_{now}.json'

        graph_path = os.path.join(path, graph_filename)
        label_path = os.path.join(path, label_filename)
        summary_path = os.path.join(result_path, summary_filename)

        with open(graph_path, 'wb') as f:
            pickle.dump(G, f)
        with open(label_path, 'wb') as f:
            pickle.dump(y, f)
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)

        graph_file = File.objects.create(
            data='datasets/' + graph_filename,
            name=graph_filename,
            volume=sizify(os.path.getsize(graph_path))
        )
        label_file = File.objects.create(
            data='datasets/' + label_filename,
            name=label_filename,
            volume=sizify(os.path.getsize(label_path))
        )
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

        # Update dataset
        dataset.x_train = graph_file
        dataset.y_train = label_file
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
        error_filename = f'graph_error_{now}.json'
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

        print(f'[Graph Generation ERROR] {str(e)}')
