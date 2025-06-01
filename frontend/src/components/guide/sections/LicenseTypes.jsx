

import { FiFileText } from 'react-icons/fi';
import politics from '../../../../public/images/politics/politicsTable.png';

const LicenseTypes = () => {
  return (
    <>
      <h3 className="text-lg font-medium text-foreground">Tipos de licencia disponibles</h3>
      <p className="mt-1 text-sm text-foreground mb-6">
        Diferentes categorías de licencias y sus características.
      </p>

      <div className="text-foreground space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-bold mt-6 mb-3 border-b pb-2 border-border">INFORMACIÓN GENERAL DE LOS CAMPOS</h4>
          <div className="space-y-3">
            <p><span className="font-semibold block">Requiere justificativo:</span> Para que la solicitud pueda ser evaluada, el responsable de recursos humanos debe contar con la documentación correspondiente asociada a la misma cargada dentro de la tolerancia que se establece.</p>
            
            <p><span className="font-semibold block">Mínimo de preaviso (dias):</span> Se considera que ciertos tipos de licencias pueden anticiparse y programarse de forma ordenada para garantizar tanto el cumplimiento de las responsabilidades laborales como los derechos del empleado. Si se indica 0 la solicitud puede pedirse para que sea efectiva en el momento.</p>
            
            <p><span className="font-semibold block">Tolerancia para la presentacion del justificativo (dias):</span> A partir de la Fecha de Inicio de la solicitud de licencia, comienzan a contabilizarse los días de tolerancia. Si la documentación requerida no se presenta dentro del plazo establecido, la solicitud cambia automáticamente al estado 'expirada' y se considera rechazada debido a la falta de documentación. Si se indica 0 la solicitud podrá realizarse sólo si se adjunta en el momento el justificativo.</p>
            
            <p><span className="font-semibold block">Total de dias por año:</span> Total de días anuales asignados a ese tipo de licencia.</p>
            
            <p><span className="font-semibold block">Máximo de días corridos:</span> Cantidad máxima de días permitidos entre la Fecha de Inicio y la Fecha de Fin de la licencia, indicando cuántos días consecutivos puede abarcar como máximo.</p>
            
            <p><span className="font-semibold block">Límite anual de pedidos aprobados:</span> Cantidad máxima de veces que se pueden solicitar y aprobar licencias de un determinado tipo durante el año.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 my-6 text-center">
          <h4 className="text-md font-bold mt-6 mb-3 border-b pb-2 border-border">POLÍTICAS DE LAS LICENCIAS</h4>
          <img src={`${politics}`} alt="Licencias" className="mx-auto" />
        </div>

        <div className="space-y-6">
          <h4 className="text-md font-bold mt-6 mb-3 border-b pb-2 border-border">DETALLES A CONSIDERAR</h4>
          
          <div className="bg-card p-4 rounded-lg border border-border">
            <h5 className="font-bold text-base mb-2">Vacaciones</h5>
            <p><span className="font-semibold block">Total de dias por año:</span> Se obtiene en base a la antigüedad(*), pero en caso de no alcanzar el mínimo de tiempo trabajado para tenerla en cuenta, se obtiene en base a los días de descanso disponibles.</p>
            <ul className="list-disc pl-5 my-2 space-y-1">
              <li>Antigüedad ≤ 5 años : 14 días corridos</li>
              <li>5 &lt; Antigüedad ≤ 10 : 21 días corridos</li>
              <li>10 &lt; Antigüedad ≤ 20: 28 días corridos</li>
              <li>20 &lt; Antigüedad: 35 días corridos</li>
            </ul>
            
            <p>Se prioriza que puedas ajustar tus vacaciones de acuerdo a tus planes personales. Sin embargo, en caso de que el supervisor encuentre, cercano al cierre de año pactado, 31 de diciembre, que no has solicitado la totalidad de días de vacaciones correspondientes se verá obligado a solicitarte la licencia para proteger tus derechos. Deberá avisarte con una anticipación mínima de 60 días</p>
            
            <p className="text-sm italic mt-2">(*antigüedad: Se tomará como base la fecha de ingreso al establecimiento. La antigüedad solo se tiene en cuenta para el cálculo de dias de vacaciones si el empleado tiene al menos medio año en la empresa. En caso contrario los dias que le corresponde de descanso se calculan como un día por cada 20 hábiles trabajados).</p>
            
            <p className="mt-3"><span className="font-semibold">Límite anual de pedidos:</span> 2 (podés tomar todos tus dias de vacaciones en 1 plazo o dividir los dias en 2 plazos).</p>
          </div>

          {[
            {
              title: "Nacimiento de hijo",
              items: [
                { label: "Autorizado a solicitar la licencia", content: "Padre del recién nacido" },
                { label: "Documentación a presentar", content: "Certificado de Nacimiento / Circunscripción del Registro Civil" }
              ]
            },
            {
              title: "Casamiento (propio, de hijos)",
              items: [
                { label: "Documentación a presentar", content: "Acta de matrimonio" }
              ]
            },
            {
              title: "Trámites prematrimoniales",
              items: [
                { label: "Documentación a presentar", content: "Constancia de turno" }
              ]
            },
            {
              title: "Asistencia a familiares",
              items: [
                { content: "Se entiende como familiares: cónyuge, padres o hijos" },
                { label: "Documentación a presentar", content: "Certificado médico" }
              ]
            },
            {
              title: "Donación de sangre",
              items: [
                { label: "Documentación a presentar", content: "Certificado expedido por la institución receptora de la donación" }
              ]
            },
            {
              title: "Mudanza",
              items: [
                { label: "Documentación a presentar", content: "Cambio de domicilio, contrato de alquiler o compra/venta, declaración jurada" }
              ]
            },
            {
              title: "Obligaciones públicas",
              items: [
                { label: "Documentación a presentar", content: "Justificativo correspondiente a la situación de citación" }
              ]
            },
            {
              title: "Estudios",
              items: [
                { label: "Documentación a presentar", content: "Certificado expedido por la Institución de estudio" }
              ]
            },
            {
              title: "Hora mensual",
              items: [
                { content: "No es una licencia de día. Se otorga una hora libre de sus funciones para realizar compras en aquellos lugares donde la discontinuidad y uniformidad de los horarios imposibilitara al mismo para concretar sus adquisiciones." }
              ]
            },
            {
              title: "Representante gremial / Reunión extraordinaria / Reunion gremial semanal",
              items: [
                { label: "Documentación a presentar", content: "Certificado expedido por gremio" }
              ]
            },
            {
              title: "Accidente de trabajo",
              items: [
                { label: "Documentación a presentar", content: "Documentación del ART" }
              ]
            },
            {
              title: "Enfermedad",
              items: [
                { label: "Documentación a presentar", content: "Certificado médico. En lo posible que el certificado no contenga información sensible de salud." }
              ]
            },
            {
              title: "Maternidad",
              items: [
                { label: "Autorizada a solicitar la licencia", content: "Gestante del embarazo" },
                { label: "Total de días por año", content: "Iniciada la licencia tenés los 90 días de reposo para que puedas atender tus necesidades y las del recién nacido. Se recomienda que esta licencia comience 45 días antes de la fecha prevista de parto. No obstante, se podrá optar por reducir el período previo al parto, siempre que este no sea inferior a 30 días." },
                { label: "Documentación a presentar", content: "Certificado médico" }
              ]
            },
            {
              title: "Duelo (A)",
              items: [
                { content: "Se entiende como licencia por Duelo (A): Padres, hijos, cónyuges o hermanos." },
                { label: "Documentación a presentar", content: "Certificado de defunción" }
              ]
            },
            {
              title: "Duelo (B)",
              items: [
                { content: "Se entiende como licencia por Duelo (B): Abuelos, padres, hermanos políticos o hijos del cónyuge." },
                { label: "Documentación a presentar", content: "Certificado de defunción" }
              ]
            },
            {
              title: "OTROS",
              items: [
                { content: "La licencia 'Otros' está diseñada para contemplar situaciones excepcionales y casos particulares que no se incluyen en los tipos de licencias habituales. La empresa considera la necesidad de este tipo de licencia ya que su propósito es ofrecer flexibilidad y apoyo al empleado ante circunstancias extraordinarias, promoviendo el cuidado del personal sin generar abusos." },
                { subheader: "Principios a tener en cuenta:" },
                { label: "Prudencia y Responsabilidad", content: "Tanto el empleado como el supervisor deberán actuar con criterio y responsabilidad al solicitar y evaluar este tipo de licencia." },
                { label: "Casos Excepcionales", content: "Esta licencia está destinada únicamente a situaciones raras o extraordinarias." },
                { label: "Evaluación Detallada", content: "Toda solicitud será analizada exhaustivamente por un supervisor." },
                { subheader: "Consideraciones Finales" },
                { content: "Esta licencia no debe ser utilizada de forma rutinaria ni para evitar la aplicación de otras licencias predefinidas. Su uso inadecuado o abusivo podría derivar en sanciones disciplinarias, según las políticas de la empresa." }
              ]
            }
          ].map((section, index) => (
            <div key={index} className="bg-card p-4 rounded-lg border border-border">
              <h5 className="font-bold text-base mb-3">{section.title}</h5>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {item.subheader && <h6 className="font-semibold text-sm mt-3 mb-1">{item.subheader}</h6>}
                    {item.label && <p><span className="font-semibold">{item.label}:</span> {item.content}</p>}
                    {!item.label && !item.subheader && <p>{item.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LicenseTypes;