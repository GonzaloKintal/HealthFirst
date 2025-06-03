import pandas as pd
import joblib
from pathlib import Path
from functools import lru_cache
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from .file_utils import normalize_text

# Paths
MODEL_PATH = Path(__file__).resolve().parent / 'modelo_clasificador.joblib'
DATASET_PATH = Path(__file__).resolve().parent / 'coherence_dataset.csv'


def load_data(csv_file: Path):
    """Loads and normalizes the dataset from a CSV file."""
    df = pd.read_csv(
        csv_file,
        delimiter=',',
        quotechar='"',
        engine='python',
        on_bad_lines='skip'
    )
    df['text'] = df['text'].apply(normalize_text)
    return df['text'].tolist(), df['clase'].tolist()


def train_and_save_model():
    texts, labels = load_data(DATASET_PATH)

    model = make_pipeline(
        TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                min_df=2,     
        ),
        RandomForestClassifier(
            n_estimators=500,
            class_weight='balanced',    
        )
    )
    model.fit(texts, labels)
    joblib.dump(model, MODEL_PATH)
    return model


# @lru_cache(maxsize=1)
def get_model():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    else:
        return train_and_save_model()


def predict_top_3(text):
    model = get_model()
    normalized_text = normalize_text(text)
    probabilities = model.predict_proba([normalized_text])[0]

    results = [
        (str(label), f"{prob * 100:.1f}%")
        for label, prob in zip(model.classes_, probabilities)
    ]

    return sorted(results, key=lambda x: float(x[1][:-1]), reverse=True)[:3]
