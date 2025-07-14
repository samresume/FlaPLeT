import os
import pickle
import numpy as np
import networkx as nx
import json
import time
from datetime import datetime
from collections import Counter

from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, confusion_matrix

from tensorflow.keras.models import Sequential, save_model
from tensorflow.keras.layers import GRU, Dense, Dropout
from tensorflow.keras.optimizers import Adam, SGD

from node2vec import Node2Vec

from solarflare.models import Project, File, ResultFile


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


def ml(id):
    try:
        path = r"C:/Users/eskan/CI/backend/datasets"
        result_path = r"C:/Users/eskan/CI/backend/file_results"
        path_w = r"C:/Users/eskan/CI/backend"

        os.makedirs(result_path, exist_ok=True)

        project = Project.objects.get(id=id)
        info = project.project_info

        model_type = info.ml_model.lower()
        train_split = info.train_split or 70

        start_time = time.time()

        # Load data
        if project.data_info:
            with open(path_w + project.data_info.x_train.data.url, 'rb') as f:
                x = pickle.load(f)
            with open(path_w + project.data_info.y_train.data.url, 'rb') as f:
                y = pickle.load(f)

        elif project.data_aug_info:
            with open(path_w + project.data_aug_info.x_train.data.url, 'rb') as f:
                x = pickle.load(f)
            with open(path_w + project.data_aug_info.y_train.data.url, 'rb') as f:
                y = pickle.load(f)

        elif project.fn_data_info:
            with open(path_w + project.fn_data_info.x_train.data.url, 'rb') as f:
                G = pickle.load(f)

            with open(path_w + project.fn_data_info.y_train.data.url, 'rb') as f:
                y = pickle.load(f)
            y = np.array(y)

            node2vec = Node2Vec(
                G,
                dimensions=info.dimensions or 64,
                walk_length=info.walk_length or 10,
                num_walks=info.num_walks or 100,
                workers=1,
                seed=42
            )
            model = node2vec.fit(
                window=info.window_size or 5,
                batch_words=info.batch_word or 4
            )

            embeddings = np.array([model.wv[str(i)] for i in range(len(y))])

            split = int(len(y) * (train_split / 100))
            X_train = embeddings[:split]
            y_train = y[:split]
            X_test = embeddings[split:]
            y_test = y[split:]

            clf = LogisticRegression(
                penalty=info.penalty or 'l2',
                solver=info.solver or 'lbfgs',
                max_iter=info.max_iter or 100
            )
            clf.fit(X_train, y_train)
            preds = clf.predict(X_test)

            model_object = clf  # Save model later
        else:
            print('[ML ERROR] No valid dataset attached.')
            return

        if project.fn_data_info is None:
            x = np.array(x)
            y = np.array(y)

            if x.ndim == 2:
                x = np.expand_dims(x, axis=1)

            num_samples = len(x)
            split = int(num_samples * (train_split / 100))
            X_train, X_test = x[:split], x[split:]
            y_train, y_test = y[:split], y[split:]

            if model_type == 'gru':
                model = Sequential()
                for i in range(info.num_layers or 1):
                    return_seq = (i != (info.num_layers or 1) - 1)
                    model.add(GRU(units=info.hidden_size or 32, return_sequences=return_seq,
                                  input_shape=(X_train.shape[1], X_train.shape[2])))
                    if info.dropout_rate:
                        model.add(Dropout(info.dropout_rate))

                model.add(Dense(1, activation='sigmoid'))

                optimizer = Adam(learning_rate=info.learning_rate or 0.001) if info.optimization == 'adam' else SGD(
                    learning_rate=info.learning_rate or 0.001)

                model.compile(loss='binary_crossentropy',
                              optimizer=optimizer, metrics=['accuracy'])

                model.fit(X_train, y_train, epochs=info.epochs or 10,
                          batch_size=info.batch_size or 32, verbose=0)

                preds = model.predict(X_test).round().astype(int).flatten()

                model_object = model  # Save model later

            elif model_type == 'svm':
                stats_features = []
                for sample in X_train:
                    features = []
                    for attr in sample:
                        weights = np.linspace(1, 2, num=attr.shape[0])
                        weighted_avg = np.average(attr, weights=weights)
                        features.extend([
                            np.mean(attr),
                            np.std(attr),
                            weighted_avg,
                            attr[0],
                            np.max(attr),
                            np.min(attr),
                        ])
                    stats_features.append(features)

                X_train_transformed = np.array(stats_features)

                stats_features = []
                for sample in X_test:
                    features = []
                    for attr in sample:
                        weights = np.linspace(1, 2, num=attr.shape[0])
                        weighted_avg = np.average(attr, weights=weights)
                        features.extend([
                            np.mean(attr),
                            np.std(attr),
                            weighted_avg,
                            attr[0],
                            np.max(attr),
                            np.min(attr),
                        ])
                    stats_features.append(features)

                X_test_transformed = np.array(stats_features)

                clf = SVC(kernel=info.kernel or 'rbf',
                          C=info.regularization_strength or 1.0, probability=True)
                clf.fit(X_train_transformed, y_train)
                preds = clf.predict(X_test_transformed)

                model_object = clf  # Save model later
            else:
                print('[ML ERROR] Unsupported model type.')
                return

        # ---------- Evaluation ----------
        tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()

        recall = recall_score(y_test, preds)
        precision = precision_score(y_test, preds)
        acc = accuracy_score(y_test, preds)
        auc = roc_auc_score(y_test, preds)

        TSS = recall + (tn / (tn + fp)) - 1
        HSS1 = 2 * (tp * tn - fp * fn) / ((tp + fn) *
                                          (fn + tn) + (tp + fp) * (fp + tn))
        HSS2 = (2 * (tp * tn - fp * fn)) / \
            ((tp + fn)*(fn + tn) + (tp + fp)*(fp + tn))

        # Compute CH for GS
        CH = ((tp + fp) * (tp + fn)) / (tp + fp + fn + tn)
        # Gilbert Skill Score
        GS = (tp - CH) / (tp + fp + fn - CH)

        # Save evaluation summary
        summary = {
            'tp': int(tp),
            'tn': int(tn),
            'fp': int(fp),
            'fn': int(fn),
            'accuracy': round(acc, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'auc': round(auc, 4),
            'TSS': round(TSS, 4),
            'HSS1': round(HSS1, 4),
            'HSS2': round(HSS2, 4),
            'GS': round(GS, 4),
            'duration': round(time.time() - start_time, 2)
        }

        now = datetime.now().strftime('%Y%m%d_%H%M%S')
        result_filename = f'ml_summary_{now}.json'
        result_path_full = os.path.join(result_path, result_filename)

        with open(result_path_full, 'w') as f:
            json.dump(summary, f, indent=2)

        result_file = ResultFile.objects.create(
            data='file_results/' + result_filename,
            name=result_filename
        )

        # Save trained model
        model_filename = f'ml_model_{now}'
        model_path_full = os.path.join(result_path, model_filename)

        if model_type == 'gru':
            model_path_full += '.h5'
            save_model(model_object, model_path_full)
        else:
            model_path_full += '.pkl'
            with open(model_path_full, 'wb') as f:
                pickle.dump(model_object, f)

        model_file = ResultFile.objects.create(
            data='file_results/' + os.path.basename(model_path_full),
            name=os.path.basename(model_path_full)
        )

        # Update Project
        project.result_file = result_file
        project.model_file = model_file
        project.status = 'completed'
        project.report_datetime = datetime.now()
        project.save()

        print(
            f"{model_type.upper()} → Acc: {acc:.4f}, Prec: {precision:.4f}, Rec: {recall:.4f}")

    except Exception as e:
        now = datetime.now().strftime('%Y%m%d_%H%M%S')
        error_summary = {
            'error': str(e),
            'duration': round(time.time() - start_time, 2)
        }
        error_filename = f'ml_error_{now}.json'
        error_path = os.path.join(result_path, error_filename)
        with open(error_path, 'w') as f:
            json.dump(error_summary, f, indent=2)

        result_file = ResultFile.objects.create(
            data='file_results/' + error_filename,
            name=error_filename
        )

        project.result_file = result_file
        project.status = 'failed'
        project.report_datetime = datetime.now()
        project.save()

        print(f'[ML ERROR] {str(e)}')
