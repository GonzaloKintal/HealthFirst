import pandas as pd

#vamos a normalizar el texto del certificado, le sacamos tildes y lo mandamos como .lower, asi no fallamos.Todas las palabras claves
#van a ser minuscula 

NACIMIENTO=["nacimiento","lugar","padre","conyuge","matricula","mn","mp","me","madre","registro civil","acta","sexo",
            "lugar","registro","clinica","hospital","testigo","dr","dra","inscripcion","tramite","libro","folio","domicilio",
            "matricula"] 
#NO PUEDEN FALTAR: nacimiento, madre, (padre/conyuge),(matricula,mn,mp,me), registro civil, acta, sexo, 
#                 (clinica/hospital/centro medico/domicilio), testigo, (dr/dra), libro, folio

#PUEDEN FALTAR: inscripcion , lugar, registro,

ESTUDIOS=["alumno","regional","facultad","examen","final","asignatura",
"materia","carrera","docente","universidad","constancia","modalidad",
"estudiante","actividad","propuesta","ubicacion","sede","evaluacion",
"certificado","turno","instituto","pedido","extiende","profesor",
"presentado","autoridades","constancia","interesado","presente",
"extiende","certifica","rendir"]

#NO PUEDEN FALTAR: (alumno/a / estudiante), (facultad/universidad/instituto), (examen / parcial /final/evaluacion), (asignatura /actividad/materia ),
#                  (carrera/propuesta), (docente /profesor/a), (constancia/certificado/pedido), 

#PUEDEN FALTAR: modalidad, ubicacion , sede, turno, pedido, extiende, presentado, autoridades, interesado, presente, certifica , rendir 

MATERNIDAD=["parto","gestacion","semana","prenatal","embarazo",
"medico","hospital","paciente","embarazada","gestacion","control","dr",
"matricula","prenatal","reposo",]

#NO PUEDEN FALTAR: parto, gestacion, semana, embarazo, (hospital/centro medico/clinica/salita), (paciente/embarazada),
#                  (dr/dra), (matricula,mp,mn,me)

#PUEDEN FALTAR: prenatal, medico, control, prenatal, reposo, licencia

CONTROL_PRENATAL=["control","prenatal","ecografia","laboratorio","embarazo"
,"parto","dr","matricula","clinica","hospital","semana","consulta",
"ecografia"]

#NO PUEDEN FALTAR: control, embarazo, (dr/dra), (matricula/mp/mn/me), (clinica/hospital/centro medico/salita),

#PUEDEN FALTAR: prenatal , ecografia, laboratorio, parto, consulta, chequeo

ACCIDENTE_DE_TRABAJO=["clinica","servicio","empresa","legajo","accidente",
"diagnostico","tratamiento","hospital","incapacidad","laboral","reposo"
"dr","mp","art","poliza","control","centro medico","reincoporacion","alta","junta medica"]
#NO PUEDEN FALTAR:  (dr/dra), (matricula/mp/mn/me), (clinica/hospital/centro medico), accidente, art, poliza, 

#PUEDEN FALTAR: servicio, empresa, diagnostico, tratamiento, incapacidad laboral, reposo, control, reincorporacion,alta
#               junta medica 

ENFERMEDAD=["dr","matricula","diagnostico","sintomas","tratamiento","reposo",
"incapacidad","control","reevaluacion","servicio","clinica","hospital",
"estudios","edad","gripe","fiebre","viral","dr","mp","paciente","dolor","consultorio"]

#NO PUEDEN FALTAR:  (dr/dra), (matricula/mp/mn/me), (clinica/hospital/centro medico/salita), reposo, paciente 

#PUEDEN FALTAR: diagnostico, sintomas, tratamiento, incapacidad, control, reevaluacion, servicio, estudios, edad, fiebre , viral, dolor,
#               consultorio,gripe, bronquitis, gastroentiritis, lumbalgia, infeccion urinaria, cefaleas, migrañas, conjuntivitis, covid

CASAMIENTO=["acta","matrimonio","registro civil","libro","folio",
"contrayentes","testigos","oficial","dr","juez de paz","matricula",
""] #tiene que aparecer su nombre y apellido

#NO PUEDEN FALTAR: acta, matrimonio, registro civil, libro, folio, testigos, (dr/dra) , matricula

#PUEDEN FALTAR: juez/ jueza de paz 

TRAMITES_PREMATRIMONIALES=[""] #sacar turno, y ese comprobante ¿que info tiene?


CASAMIENTO_DE_HIJOS=["acta","matrimonio","registro civil","libro","folio",
"contrayentes","testigos","oficial","dr","juez de paz","matricula",
""] #Obvio no tienen que estar sus datos, puede aparecer el apellido.
#Y tendria que pensar en algo mas.

#NO PUEDEN FALTAR: acta, matrimonio, registro civil, libro, folio, testigos, (dr/dra) , matricula

#PUEDEN FALTAR: juez/ jueza de paz 

ASISTENCIA_A_FAMILIARES=[""]

DUELO_A=["Registro civil","causa","",Certificado","Defuncion","tomo","folio","libro de defunciones","ocurrida","nacionalidad"
"estado civil","domiciliado","consecuencia","acta","documento","deceso","certificado medico",
"expedido","dr","diagnositico"]

DUELO_B=[""] #chequear tipo de familiar 

#COMUN A DUELO

#NO PUEDEN FALTAR: registro civil,nombre, apellido, sexo, nacionalidad, domicilio, (causa/diagnostico), (dr/dra),
#                   (matricula/mp/me/mn), defuncion, tomo, folio, estado civil, acta, certificado

#PUEDEN FALTAR: domiciliado, consecuencia, deceso, ceritficado medico, expedido, padre, madre, padres, lugar 



DONACION_SANGRE=["hospital","donacion","sangre","concurrencia",
"constancia","donar","clinica","donante","receptor","certificado laboral",
"tecnico responsable","centro medico",
"instituto de hemoterapia","matricula","dr","banco de sangre","centro"
]

#NO PUEDEN FALTAR: (hospital/clinica/instituto de hemoterapia/centro medico/banco de sangre),donacion, sangre, donante, (matricula/me/mn/mp)

#PUEDEN FALTAR: concurrencia, constancia, donar, concurrencia, constancia, donar, receptor, certificado laboral,
#tecnico responsable

MUDANZA=["Registro Nacional de las Personas","Constancia","cambio de domicilio","residencia"
,"RENAPER","Codigo de tramite","Contrato de locacion","inmueble","inquilino","vivienda","inmobiliaria","propiedad","dr"
"mudanza","escribania","escritura","propiedad","escribano","matricula","posesion","comprador","traslado","Esc"
,"servicio de mudanza","residencia","domicilio","encargado de logistica","contrato de alquiler",
"locador","locatorio","plazo","monto","escribano","boleto de compraventa","vendedor","escrituracion","certificado de domicilio"
,"notificacion de mudanza","propietario","fecha de desocupacion","testigo","direccion"]

#NO PUEDEN FALTAR: (boleto de compraventa/contrato de locacion/cambio de domicilio/servicio de mudanza/contrato de alquiler),
# (inmueble/residencia/vivienda/propiedad/residencia)(inquilino/locatorio/comprador/propietario), 
# (locador/vendedor), (domicilio/direccion)

#PUEDEN FALTAR: nueva residencia, renaper, codigo de tramite, inmobiliaria, dr, posesion, traslado, mudanza,domicilio,
# encargado de logistica, plazo, monto, escrituracion, certificado de domicilio, fecha de desocupacion, testigo, notificacion de mudanza,
#  escribano, esc, matricula, registro nacional de las personas


OBLIGACIONES_PUBLICAS= ["citacion","expediente","ciudadano","motivo","citacion obligatoria"
,"jurado","juicio","sede","tribunal","juez","testigo","causa penal"
"sede","juez",,"comparencia","audiencia","reclamo","funcionario","designacion obligatoria","elecciones",
"entrevista","inspector","matricula","ley","articulo","notificacion",
"requerimiento","expediente"]

#NO PUEDEN FALTAR: 

#PUEDEN FALTAR: 


REUNION_GREMIAL=["certificado","asistencia","reunion","gremial",""]



REPRESENTANTE_GREMIAL=["reunion","gremial","sindicato","empleados","delegado","legajo","lugar","hora","orden del dia","paritarias"
"condiciones","comision","articulo","credencial","secretario",
"convocatoria","urgente","sede","motivo","despedido","presentacion",
"laboral","conflictos","asamble","informativa","estrategias","denuncia"
"pago","citacion","jornada","capacitacion","derechos laborales",
"seguridad","certificado","inasistencia","actividad",""]

#NO PUEDEN FALTAR: (gremio/gremial/sindicato), reunion,(delegado/miembro),lugar, hora, (motivo/asunto), 

#PUEDEN FALTAR: empleados, legajo, orden del dia, paritarias, condiciones, comision, articulo, credencial, secretario,directora, 
#                convocatoria, urgente, sede, despedido, presentacion, laboral, conflictos, asamblea, informativa, 
#               estrategias, denuncia, pago, citacion, jornada, capacitacion, derechos, seguridad, certificado, 
#               inasistencia, actividad


REUNION_EXTRAORDINARIA=["reunion","extraordinaria","acta","constancia"
"trabajadores","laborales","lugar","sindicato","empleado",
"trabajador","comision","dependencia","union","operarios","convocada","presencia","justificacion",
"comercio","sector","convocatoria","asociacion"
"medidas","urgente","asistio","afiliado"]

#NO PUEDEN FALTAR: reunion, extraordinaria, acta, lugar, (sindicato/gremio), (empleado/trabajador), (certificado/justificacion/constancia)

#PUEDEN FALTAR:  trabajadores, laborales, comision, dependencia, union, operarios, convocada, presencia, comercio, sector
#convocatoria, asociacion, medidas, urgente, asistio, afiliado


#Cargar el dataset
df=pd.read_csv("tipo_licencias_dataset.csv")

#Columnas dinamicas sobre el contenido de las licencias
df['Longitud_Texto']=df['texto_licencia'].apply(len)
df['Contiene_Palabras_Claves']=apply x:1 if 

