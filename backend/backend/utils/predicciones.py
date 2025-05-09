import pandas as pd
import re
import file_utils 

NACIMIENTO_must=[["nacimiento"],["lugar","domicilio"],["padre","conyuge","padre/conyuge"],["matricula","mn","mp","me"],["registro civil"],["sexo"],
                 ["acta"],["clinica","hospital","centro medico","salita","centro de salud"],["dr","dra"],["libro"],["folio"]]
NACIMIENTO_could=["madre","registro","inscripcion","tramite","testigo","testigos"]

ESTUDIOS_must=[["alumno","alumna","alumno/a","estudiante"],["facultad","universidad","instituto"],["examen","final","evaluacion"],
               ["asignatura","materia","actividad"],["carrera","propuesta"],["docente","profesor","profesora"]]
ESTUDIOS_could=["regional","modalidad","ubicacion","sede","turno","rendir","realizar"]

CONTROL_PRENATAL_must=[["control","consulta"],["embarazo","prenatal"],["dr","dra"],["matricula","mn","mp","me"]]
CONTROL_PRENATAL_could=["clinica","consultorio","obstetra","ginecologo","hospital","centro de salud","centro medico","ecografia","laboratorio","gestacion","parto","semana"]

ACCIDENTE_TRABAJO_must=[["dr","dra"],["matricula","mn","mp","me"],["clinica","hospital","centro medico","salita","centro de salud"],
                        ["art"],["poliza"],["accidente","incidente","lesion"]["legajo"]]
ACCIDENTE_TRABAJO_could=["servicio","empresa","diagnostico","tratamiento","incapacidad","laboral","reposo","licencia","control",
                         "reincorporacion","alta","junta medica"]

ENFERMEDAD_must=[["dr","dra"],["matricula","mn","mp","me"],["reposo","licencia","descanso"]]
ENFERMEDAD_could=["clinica","hospital","centro medico","salita","centro de salud","sintomas","tratamiento","control","clinica",
                  "hospital","estudios","gripe","viral","paciente","dolor","consultorio","diagnostico"]

CASAMIENTO_must=[["acta"],["matrimonio"],["registro civil"],["libro"],["folio"],["testigo","testigos"],["dr","dra"],
                 ["matricula","mn","mp","me"]]
CASAMIENTO_could=["juez de paz","jueza de paz"]

DUELO_must=[["registro civil"],["sexo"],["nacionalidad"],["causa","diagnostico","consecuencia"],["dr","dra"],
            ["matricula","mn","mp","me"],["defuncion"],["tomo"],["libro"],["estado civil"],["acta"]]
DUELO_could=["deceso"] #capaz esta demas 

DONACION_SANGRE_must=[["hospital","instituto de hemoterapia","banco de sangre","clinica","centro medico"],["donar","donacion"],
                      ["sangre"],["matricula","mn","mp","me"]]
DONACION_SANGRE_could=["donante","receptor","tecnico responsable"]

MUDANZA_must=[["boleto de compraventa","contrato de locacion","cambio de domicilio","servicio de mudanza","contrato de alquiler"]
              ,["inmueble","residencia","vivienda","propiedad","residencia"],["inquilino","locatorio","comprador","propietario"],
              ["locador","vendedor"],["domicilio","direccion"]]
MUDANZA_could=["nueva residencia","renaper","inmobiliaria","traslado","mudanza","encargado de logistica","plazo","escrituracion",
               "certificado de domicilio","fecha de desocupacion","testigo","notificacion de mudanza","escribano","esc", "matricula","mn","mp","me",
               ,"dr","dra","registro nacional de las personas"]

REUNION_EXT_must=[["reunion"],["extraordinario","extraordinaria"],["acta"],["lugar"],["sindicato","gremio","gremial"],["afiliado","empleado","trabajador"]]
REUNION_EXT_could=["comision","dependencia","union","operarios","convocada","comercio","convoctoria","medidas","urgente"]


OBLIGACION_PUBLICA_must=[["citacion","notificacion"],["expediente"],["obligatoria","obligatorio"],["matricula"]]
OBLIGACION_PUBLICA_could=["jurado","juicio","sede","tribunal","juez","testigo","causa penal","entrevista","inspector","ley",
                          "articulo","requerimiento","expediente","ciudadano","audiencia","reclamo","funcionario","elecciones"]

REPRESENTANTE_GREMIAL_must=[["gremial","gremio","sindicato"],["reunion","junta"],["delegado","miembro"],["lugar"],["motivo","asunto","actividad"]]
REPRESENTANTE_GREMIAL_could=["empleados","legajo","orden del dia","paritarias","condiciones","comision","articulo","credencial","secretario",
                             "directora","convocatoria","urgente","despedido","laboral","conflictos","asamblea","informativa","estrategias",
                             "denuncia","pago","citacion","jornada","capacitacion","derechos","seguridad"]




MATERNIDAD_must=[[""]]
MATERNIDAD_could=[""]



def create_strict_feature(text, must_find, could_find, n_minimum):
    """Se encarga de juzgar si un atributo se cumple o no por: palabras que tienen que aparecer, palabras que podrian
    aparecer(y el minimo de estas)"""

    normalized_text =file_utils.normalize_text(normalized_text) 
    for word_group in must_find: #chequeamos palabras claves
        pattern = r'\b(?:' + '|'.join([re.escape(w) for w in word_group]) + r')(?:[.:]\S*|\s+)?\b' #buscamos cualquier palabra del grupo sinonimo
        if not re.search(pattern, normalized_text):
            return 0  #no encontró una palabra clave, se descarta
        
    count = 0 #vemos cuantas palabras secundarias se encontraron para ver si llegamos al minimo (aca no trabajamos sinonimos).Si no llegamos, se descarta
    for word in could_find:
        pattern = r'\bword(?:[.:]\S*|\s*)?\b'
        if re.search(pattern, normalized_text):
            count += 1 
            if count >= n_minimum:
                return 1
    return 0

#Cargar el dataset
df=pd.read_csv("tipo_licencias_dataset.csv")




"""
MATERNIDAD=["parto","gestacion","semana","prenatal","embarazo",
"medico","hospital","paciente","embarazada","gestacion","control","dr",
"matricula","prenatal","reposo",]
#NO PUEDEN FALTAR: parto, gestacion, semana, embarazo, (hospital/centro medico/clinica/salita), (paciente/embarazada),
#                  (dr/dra), (matricula,mp,mn,me)

#PUEDEN FALTAR: prenatal, medico, control, prenatal, reposo, licencia






TRAMITES_PREMATRIMONIALES=[""] #sacar turno, y ese comprobante ¿que info tiene?



ASISTENCIA_A_FAMILIARES=[""] #FALTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA


REUNION_GREMIAL=["certificado","asistencia","reunion","gremial",""] #FALTAAAAAAAAAAAAAAAAAAA


"""