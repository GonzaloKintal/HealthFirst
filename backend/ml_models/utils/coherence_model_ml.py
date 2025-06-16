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
# Paths
MODEL_PATH = Path(__file__).resolve().parent / 'modelo_clasificador.joblib'
DATASET_PATH = Path(__file__).resolve().parent / 'coherence_license_type_dataset.csv'


def load_data(csv_file: Path):
    """Loads and normalizes the dataset from a CSV file, keeping only rows with estado='aprobado'."""
    df = pd.read_csv(
        csv_file,
        delimiter=',',
        quotechar='"',
        engine='python',
        on_bad_lines='skip'
    )
    
    # Filtramos solo las filas con estado 'aprobado'
    df = df[df['estado'] == 'aprobado']

    df['text'] = df['text'].apply(normalize_text)

    return df['text'].tolist(), df['clase'].tolist()



def train_and_save_model():
    texts, labels = load_data(DATASET_PATH)

    # Dividir en entrenamiento y test
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=20, random_state=42, stratify=labels
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

    return model

def get_model():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    else:
        return train_and_save_model()


def predict_license_types(text):
    model = get_model()
    normalized_text = normalize_text(text)
    probabilities = model.predict_proba([normalized_text])[0]

    results = [
        (str(label), f"{prob * 100:.1f}%")
        for label, prob in zip(model.classes_, probabilities)
    ]

    return sorted(results, key=lambda x: float(x[1][:-1]), reverse=True)[:3]
