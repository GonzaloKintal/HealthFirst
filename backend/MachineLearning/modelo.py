import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import json

#esto es solo un poco de codigo para ver como funciona el modelo de Random forest, se está probando como funciona con 
# el requerimiento asociado a saber si una licencia necesita el justificativo/certificado

# esto para cargar los datos del dataset, todavia no se si está bien
#query = "SELECT type, required_days, justified FROM licencias"
#data = pd.read_sql(query, conn)
#conn.close()

print("hello word")
print("---------------Entreno el modelo--------------")

#Me traigo la info del json
with open("pruebas.json", "r") as file:
    json_data = json.load(file)

data = pd.DataFrame(json_data) #lo paso a un dataframe

print(data.head()) #muestro los datos que se van a usar para el entrenamiento


# Defino las características X y variable objetivo X , las caractristicas 
# son lo que se tendrà en cuenta para luego darle un valor a Y q seria si necesito el certificado
X = data[["type", "required_days"]]
y = data["justified"]

#pasa los valores de type a numeros
X = pd.get_dummies(X)

#se divide la info en dos partes, para pruebas y para test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# se instanciaa y entrena el modelo
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)


accuracy = accuracy_score(y_test, y_pred)
print(f"Precisión del modelo: {accuracy:.2f}")


print("---------------creo nueva solicitud--------------")
feature_names = X_train.columns
# csreo una nueva solicitud
nueva_solicitud = pd.DataFrame({
    "type": ["Vacaciones"],
    "required_days": [5]
})

#se pasan las categorias a numeros
nueva_solicitud = pd.get_dummies(nueva_solicitud)

# aseguro que tenga las mismas columnas que el entrenamiento
for col in feature_names:
    if col not in nueva_solicitud:
        nueva_solicitud[col] = 0  # agrego columnas faltantes con valor 0

# reordeno columnas para que coincidan con el entrenamiento
nueva_solicitud = nueva_solicitud[feature_names]

# predicción
prediccion = rf.predict(nueva_solicitud)
print("¿Debe justificar la licencia?", "Sí" if prediccion[0] == 1 else "No")



