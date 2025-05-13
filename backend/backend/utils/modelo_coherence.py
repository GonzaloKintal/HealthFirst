import re
import unicodedata
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder  # Cambiado de LabelBinarizer



def normalize_text(text):
    """Normaliza texto: minúsculas, sin tildes, sin puntuación, espacios simples, conserva ñ/Ñ"""
    # Paso 1: Eliminar tildes pero conservar ñ/Ñ
    clean_text = []
    for char in text:
        if char in ['ñ', 'Ñ']:
            clean_text.append(char)
        else:
            normalized_char = unicodedata.normalize('NFD', char)
            clean_text.append(''.join(c for c in normalized_char if unicodedata.category(c) != 'Mn'))
    text = ''.join(clean_text).lower()
    
    # Paso 2: Eliminar todo excepto letras, números, espacios y ñ/Ñ
    text = re.sub(r'[^\wñÑ\s]', '', text)
    
    # Paso 3: Normalizar espacios
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def words_from_set(text, word_set):
    """Cuenta palabras de un set en un texto (normalizado y tokenizado)"""
    text = normalize_text(text)  # Aseguramos normalización
    words = text.split()  # Tokenización simple (mejorar con nltk si hay casos complejos)
    word_set = {normalize_text(word) for word in word_set}  # Normalizar el set también
    return sum(1 for word in words if word in word_set)
# Cargar modelo BERT
model_bert = SentenceTransformer("hiiamsid/sentence_similarity_spanish_es")

# Cargar datos
df = pd.read_csv("HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv", encoding="utf-8")

# Preprocesar textos
df["text_clean"] = df["text_license"].apply(normalize_text)

# Generar embeddings
X_embeddings = model_bert.encode(df["text_clean"].tolist(), convert_to_numpy=True)

# Preparar etiquetas - USAMOS LABELENCODER AHORA
le = LabelEncoder()
y = le.fit_transform(df['real_license_type'].values)

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(
    X_embeddings, y, test_size=0.2, random_state=42
)

print("Número de clases:", len(le.classes_))
print("Clases:", le.classes_)

# Entrenar modelo - AHORA DIRECTAMENTE RandomForest
model = RandomForestClassifier(
    n_estimators=200,
    class_weight='balanced',
    max_depth=5,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluar
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy * 100:.2f}%")

def predict_top3(text, model, bert_model, label_encoder, k=3):
    """
    Versión corregida para clasificación multiclase single-label
    """
    try:
        # 1. Preprocesar texto
        text_clean = normalize_text(text)
        
        # 2. Generar embedding
        embedding = bert_model.encode([text_clean], convert_to_numpy=True)
        
        # 3. Predecir probabilidades
        probas = model.predict_proba(embedding)[0]  # Shape: (n_classes,)
        
        # 4. Validar número de clases
        n_classes = len(label_encoder.classes_)
        if len(probas) != n_classes:
            raise ValueError(f"Modelo devolvió {len(probas)} probabilidades pero hay {n_classes} clases")
        
        # 5. Obtener top k
        top_indices = np.argsort(probas)[-k:][::-1]
        top_categories = [(label_encoder.classes_[i], float(probas[i])) for i in top_indices]
        
        return top_categories
    
    except Exception as e:
        print(f"Error en predicción: {str(e)}")
        return [("Error", 0.0)] * k

# Ejemplo
nuevo_texto = "Hospital de Hemoterapia Buenos Aires Fecha: 15 de octubre de 2024 Certifico que el Sr. Luis Fernández, DNI 20.345.678, realizó una donación voluntaria de sangre en nuestra institución el día 14 de octubre de 2024. Según el artículo 82° del Convenio Colectivo de Trabajo de Comercio, el Sr. Fernández tiene derecho a un día de licencia laboral por esta donación. Firma: Dra. Verónica Pérez Matrícula: 7896543 Sello del Hospital: Hospital de Hemoterapia Buenos Aires - Tel. 4551-2345"
top3 = predict_top3(nuevo_texto, model, model_bert, le)
print("Top 3:", top3)

