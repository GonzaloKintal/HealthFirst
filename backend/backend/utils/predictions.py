import joblib
import numpy as np
from file_utils import normalize_text

# Carga los componentes una vez al importar el script
components = joblib.load("license_classifier.joblib")
model = components["model"]
bert_model = components["bert_model"]
le = components["label_encoder"]

def predict_top3(text):
    """Devuelve el top 3 de categorías con probabilidades. """
    try:
        #Preprocesar y generar embedding
        text_clean = normalize_text(text)
        embedding = bert_model.encode([text_clean], convert_to_numpy=True)
        
        #Predecir probabilidades
        probas = model.predict_proba(embedding)[0]
        
        #Obtener top 3
        top_indices = np.argsort(probas)[-3:][::-1]
        top3 = [
            (le.classes_[i], f"{round(probas[i] * 100)}%")  # Redondea y añade %
            for i in top_indices
        ]
        return top3
    
    except Exception as e:
        print(f"Error: {e}")
        return [("Error", 0.0)] * 3
    
texto="Escuela Superior de Enfermería Cecilia Grierson CERTIFICADO DE EXAMEN Nombre: Florencia P. Martínez DNI 38.654.987 Carrera: Enfermería Universitaria Materia: Emergentología (Código: ENF-305) Fecha: 03/10/2024 Turno: Mañana Nota: Aprobado Observaciones: Examen clínico simulad o Válido para justificar inasistencia Firma: Lic. Rosa M. Quiroga (Matrícula: 12.345)"
print(predict_top3(texto))
