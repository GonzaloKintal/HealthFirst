from cProfile import label
import pandas as pd
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from .file_utils import normalize_text
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from .spanish_stopwords import SPANISH_STOPWORDS
from ml_models.models import MLModel
from datetime import datetime
from ml_models.models import LicenseDatasetEntry
# Paths
MODEL_PATH = Path(__file__).resolve().parent / 'modelo_clasificador.joblib'
DATASET_PATH = Path(__file__).resolve().parent / 'coherence_license_type_dataset.csv'


def load_data_from_db():
    """Carga el dataset desde la base de datos, manteniendo solo las filas con estado='approved'."""
    queryset = LicenseDatasetEntry.objects.filter(
        status='approved'
    ).values('id', 'text', 'type')
    
    df = pd.DataFrame.from_records(queryset)

    first_id = df['id'].min() if not df.empty else None
    last_id = df['id'].max() if not df.empty else None

    return {
        'texts': df['text'].tolist(),
        'types': df['type'].tolist(),
        'first_id': first_id,
        'last_id': last_id
    }



def train_and_save_coherence_model():
    data = load_data_from_db()
    texts = data['texts']
    types = data['types']
    first_id = data['first_id']
    last_id = data['last_id']

    # Dividir en entrenamiento y test
    X_train, X_test, y_train, y_test = train_test_split(
        texts, types, test_size=20, random_state=42, stratify=types
    )

    model = make_pipeline(
        TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            stop_words=SPANISH_STOPWORDS
        ),
        RandomForestClassifier(
            n_estimators=500,
            class_weight='balanced',
        )
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # # Mostrar métricas
    # accuracy_score(y_test, y_pred)
    # classification_report(y_test, y_pred)

    # Guardar modelo
    joblib.dump(model, MODEL_PATH)
    MLModel.objects.create(
        model_type= 'CLASSIFICATION',
        name= 'Modelo de coherencia de certificados',
        algorithm= 'RANDOM_FOREST',
        is_active= True,
        training_date = datetime.now(),
        first_training_id= first_id,
        last_training_id= last_id
        )

    return model

def get_model():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    else:
        return train_and_save_coherence_model()


def predict_license_types(text):
    model = get_model()
    normalized_text = normalize_text(text)
    probabilities = model.predict_proba([normalized_text])[0]

    results = [
        (str(label), f"{prob * 100:.1f}%")
        for label, prob in zip(model.classes_, probabilities)
    ]

    return sorted(results, key=lambda x: float(x[1][:-1]), reverse=True)[:3]
