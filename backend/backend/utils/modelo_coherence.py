import re
import unicodedata
import numpy as np
import pandas as pd
import joblib

from file_utils import normalize_text
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


# Cargar datos
df = pd.read_csv("HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv", encoding="utf-8")

#Preprocesar textos
df["text_clean"] = df["text_license"].apply(normalize_text)

#Generar embeddings con Sentence-BERT
print("Generando embeddings...")
model_bert = SentenceTransformer("hiiamsid/sentence_similarity_spanish_es")
X_embeddings = model_bert.encode(df["text_clean"].tolist(), convert_to_numpy=True)

#Preparar etiquetas
le = LabelEncoder()
y = le.fit_transform(df['real_license_type'].values)

#Entrenar modelo
print("Entrenando modelo...")
X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=200, class_weight='balanced', max_depth=5, random_state=42)
model.fit(X_train, y_train)

#Evaluar
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy * 100:.2f}%")

#Guardar todos los componentes
print("Guardando modelo...")
model_components = {
    "model": model,
    "bert_model": model_bert,
    "label_encoder": le
}
joblib.dump(model_components, "license_classifier.joblib")
print("Modelo guardado como 'license_classifier.joblib'")