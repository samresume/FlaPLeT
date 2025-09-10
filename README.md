## FlaPLeT: A Full-Stack Web Platform for End-to-End Time Series Data Processing and Machine Learning in Solar Flare Prediction

<img src="flaplet.gif" width="600" alt="FlaPLeT Demo" title="FlaPLeT Demo">

## 📹 Demo Videos

**1. FlaPLeT Architecture Overview**  
This video presents a high-level explanation of the system architecture, including how Django, React, Celery, PostgreSQL, Redis, Nginx, and Waitress work together to support asynchronous machine learning workflows. 

▶️ [Watch on YouTube](https://www.youtube.com/watch?v=g-JB8GZnXdI&t=46s)

**2. FlaPLeT Functionality Demonstration**  
In this video, I log in to the FlaPLeT platform and demonstrate every feature: dataset upload, preprocessing, data augmentation (SMOTE), graph generation, ML training (GRU, SVM, Node2Vec), and downloading reports or models. 

▶️ [Watch on YouTube](https://www.youtube.com/watch?v=gbGtOxnmhVw)

## 📑 Project Funding

This platform was developed as part of a research effort supported by the **National Science Foundation (NSF)** under the **Office of Advanced Cyberinfrastructure (OAC)**, aimed at providing researchers with seamless access to time series data preprocessing, augmentation, and machine learning workflows through a user-friendly web interface.

- **Recipient Institution**: Utah State University  
- **Award Number**: [2305781](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2305781&HistoricalAwards=false)  
- **Project Title**: *CRII: OAC: Cyberinfrastructure for Machine Learning on Multivariate Time Series Data and Functional Networks*  
- **Award Period**: October 1, 2022 – May 31, 2025 (estimated)  
- **Total Award Amount**: $174,984.00

## 📄 Publication Status

The paper describing this platform is currently under review at *SoftwareX*.

## 🏗️ System Architecture

The platform, *FlaPLeT* (**Fla**re **P**rediction by **Le**arning from **T**ime Series), is a modular web application designed for AI-based multivariate time series (MVTS) analysis and solar flare prediction.

The system architecture includes:

- **Frontend**: Built with React JS and styled using Material UI (MUI), enabling a clean, responsive, and component-based user interface.
- **Backend**: Developed using Django and served with Waitress, the backend handles routing, user sessions, RESTful APIs, and database interactions via Django's ORM.
- **Asynchronous Processing**: Long-running tasks such as preprocessing, augmentation, graph construction, and ML training are managed by Celery with Redis as the message broker.
- **Web Server**: NGINX serves static files, manages HTTPS traffic, and proxies API requests to the backend.
- **Database**: All data, including users, datasets, and results, are stored in a PostgreSQL database, ensuring reliability, transactional integrity, and scalability.

This architecture ensures seamless interaction between components while supporting scalable, real-time AI workflows.

<img src="Architecture.svg" width="600" alt="AI Web App Architecture" title="AI Web App Architecture">

## 🚀 Platform Features

The platform provides an end-to-end environment for working with multivariate time series (MVTS) data, tailored for solar flare prediction. It supports data upload, preprocessing, augmentation, graph-based transformation, and machine learning classification, all through an interactive web interface.

### 1. Dataset Upload & Preprocessing
- Upload `.pkl`-format MVTS datasets (up to 25MB).
- Missing value handling: mean imputation or sample removal.
- Normalization options: z-score or min-max scaling.
- Output: Processed dataset and downloadable summary report (data shape, label distribution, normalization stats).

### 2. Data Augmentation
- Supports **SMOTE** and **TimeGAN** techniques.
- Configurable parameters:
  - SMOTE: `k_neighbors`
  - TimeGAN: `batch_size`, `num_layers`, `iteration`
- Output: Augmented dataset and detailed report (class distribution before/after, technique used, runtime).

### 3. Functional Network Generation
- Constructs graph-based datasets via Pearson correlation analysis.
- User-defined correlation threshold and max neighbors.
- Output: Graph (`.gpickle`), labels, and report (nodes, edges, label stats).

### 4. Machine Learning Classification
- **GRU** (for MVTS): customizable layers, hidden size, dropout, learning rate, batch size, epochs, and optimizer (`Adam`, `SGD`).
- **SVM** (for MVTS): kernel selection and regularization strength.
- **Node2Vec + Logistic Regression** (for graph data): embedding dimensions, walk length, window size, batch size, regularization penalty, solver, and iteration count.
- Output: Trained model and evaluation report (Accuracy, Precision, Recall, AUC, TSS, HSS, GS).

### 5. Task Management & Reporting
- All tasks run asynchronously and are tracked by status (`running`, `completed`, `failed`).
- Users can view task metadata, download results, and manage completed tasks.
- Each task card displays title, description, status, hyperparameters, and relevant download buttons.

  
## 🤝 Collaboration & Contact

If you're working on a similar AI-based web application and are looking for guidance, collaboration, or have any questions, feel free to reach out.

📧 **Contact**: Sam EskandariNasab  
✉️ **Email**: [sameskandarinasab@gmail.com](mailto:sameskandarinasab@gmail.com)

## License

This project is licensed under the MIT License.
