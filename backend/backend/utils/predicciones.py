import pandas as pd

NACIMIENTO=["Nacimiento","lugar","padre","matricula","madre",]

ESTUDIOS=["alumno","regional","facultad","examen","final","asignatura",
"materia","carrera","docente","universidad","constancia","modalidad",
"estudiante","actividad","propuesta","ubicacion","sede","evaluacion",
"certificado","turno","instituto","pedido","extiende","profesor",
"presentado","autoridades","constancia","interesado","presente",
"extiende","certifica","rendir"]

MATERNIDAD=["parto","gestacion","semana","prenatal","embarazo"]
CONTROL_PRENATAL=["control","prenatal","ecografia","laboratorio","embarazo","parto",""]
ACCIDENTE_DE_TRABAJO=[""]
ENFERMEDAD=[""]
CASAMIENTO=[""]
TRAMITES_PREMATRIMONIALES=[""]
CASAMIENTO_DE_HIJOS=[""]
ASISTENCIA_A_FAMILIARES=[""]
DUELO_A=[""]
DUELO_B=[""]
DONACION_SANGRE=[""]
MUDANZA=[""]
OBLIGACIONES_PUBLICAS=[""]
REUNION_GREMIAL=[""]
REPRESENTANTE_GREMIAL=[""]
REUNION_EXTRAORDINARIA=["reunion","extraordinaria","trabajadores","laborales","lugar","sindicato","empleados","trabajador","comision","dependencia","union","obrera","operarios",""]

#Cargar el dataset
df=pd.read_csv("tipo_licencias_dataset.csv")

#Columnas dinamicas sobre el contenido de las licencias
df['Longitud_Texto']=df['texto_licencia'].apply(len)
df['Contiene_Palabras_Claves']=apply x:1 if 

