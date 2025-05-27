# Test info

- Name: Empleado pide licencia Nacimiento de hijo 2 dias
- Location: C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaNacHijo.spec.js:4:1

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.react-datepicker__day--026:not(.react-datepicker__day--outside-month)')
    - locator resolved to <div title="" tabindex="-1" role="option" aria-disabled="true" aria-selected="false" aria-label="Not available lunes, 26 de mayo de 2025" class="react-datepicker__day hover:bg-gray-100 rounded transition-colors focus:outline-none react-datepicker__day--026 react-datepicker__day--disabled">26</div>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    54 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

    at C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaNacHijo.spec.js:17:96
```

# Page snapshot

```yaml
- navigation:
  - list:
    - listitem:
      - link "Dashboard":
        - /url: /dashboard
        - img
        - text: Dashboard
    - listitem:
      - link "Mis Licencias":
        - /url: /licenses
        - img
        - text: Mis Licencias
    - listitem:
      - link "Solicitar Licencia":
        - /url: /request-license
        - img
        - text: Solicitar Licencia
    - listitem:
      - link "Mis Datos":
        - /url: /my-data
        - img
        - text: Mis Datos
- paragraph: Powered by VOX DEI SOLUTIONS
- banner:
  - button:
    - img
  - img "Logo ProHealth"
  - heading "HealthFirst" [level=1]
  - button "Activar dark mode":
    - img
  - button "J Juan Empleado":
    - text: J Juan Empleado
    - img
- main:
  - heading "Solicitar Licencia" [level=1]
  - heading "Datos Personales" [level=2]:
    - img
    - text: Datos Personales
  - text: Nombre
  - textbox: Juan
  - text: Apellido
  - textbox: Saltiva
  - text: DNI
  - textbox: "78115680"
  - text: Departamento/Área
  - textbox: Tecnología
  - text: Número
  - textbox: "1109899765"
  - heading "Detalles de la Licencia" [level=2]:
    - img
    - text: Detalles de la Licencia
  - text: Tipo de Licencia *
  - combobox:
    - option "Seleccionar tipo"
    - option "Vacaciones"
    - option "Nacimiento de hijo" [selected]
    - option "Estudios"
    - option "Maternidad"
    - option "Control prenatal"
    - option "Accidente de trabajo"
    - option "Enfermedad"
    - option "Casamiento"
    - option "Trámites patriomaniales"
    - option "Casamiento de hijos"
    - option "Asistencia a familiares"
    - option "Duelo(A)"
    - option "Duelo(B)"
    - option "Donación de sangre"
    - option "Mudanza"
    - option "Obligaciones públicas"
    - option "Hora mensual"
    - option "Cumpleaños"
    - option "Reunión gremial"
    - option "Representante gremial"
    - option "Reunión extraordinaria"
    - option "Otros"
  - text: Días Solicitados
  - textbox: Se calculará automáticamente
  - text: Fecha de Inicio *
  - textbox "Seleccione fecha de inicio"
  - dialog "Choose Date":
    - alert
    - button "Next Month"
    - heading "mayo 2025" [level=2]
    - text: lu ma mi ju vi sá do
    - listbox "Month mayo, 2025":
      - option "Not available lunes, 28 de abril de 2025" [disabled]: "28"
      - option "Not available martes, 29 de abril de 2025" [disabled]: "29"
      - option "Not available miércoles, 30 de abril de 2025" [disabled]: "30"
      - option "Not available jueves, 1 de mayo de 2025" [disabled]: "1"
      - option "Not available viernes, 2 de mayo de 2025" [disabled]: "2"
      - option "Not available sábado, 3 de mayo de 2025" [disabled]: "3"
      - option "Not available domingo, 4 de mayo de 2025" [disabled]: "4"
      - option "Not available lunes, 5 de mayo de 2025" [disabled]: "5"
      - option "Not available martes, 6 de mayo de 2025" [disabled]: "6"
      - option "Not available miércoles, 7 de mayo de 2025" [disabled]: "7"
      - option "Not available jueves, 8 de mayo de 2025" [disabled]: "8"
      - option "Not available viernes, 9 de mayo de 2025" [disabled]: "9"
      - option "Not available sábado, 10 de mayo de 2025" [disabled]: "10"
      - option "Not available domingo, 11 de mayo de 2025" [disabled]: "11"
      - option "Not available lunes, 12 de mayo de 2025" [disabled]: "12"
      - option "Not available martes, 13 de mayo de 2025" [disabled]: "13"
      - option "Not available miércoles, 14 de mayo de 2025" [disabled]: "14"
      - option "Not available jueves, 15 de mayo de 2025" [disabled]: "15"
      - option "Not available viernes, 16 de mayo de 2025" [disabled]: "16"
      - option "Not available sábado, 17 de mayo de 2025" [disabled]: "17"
      - option "Not available domingo, 18 de mayo de 2025" [disabled]: "18"
      - option "Not available lunes, 19 de mayo de 2025" [disabled]: "19"
      - option "Not available martes, 20 de mayo de 2025" [disabled]: "20"
      - option "Not available miércoles, 21 de mayo de 2025" [disabled]: "21"
      - option "Not available jueves, 22 de mayo de 2025" [disabled]: "22"
      - option "Not available viernes, 23 de mayo de 2025" [disabled]: "23"
      - option "Not available sábado, 24 de mayo de 2025" [disabled]: "24"
      - option "Not available domingo, 25 de mayo de 2025" [disabled]: "25"
      - option "Not available lunes, 26 de mayo de 2025" [disabled]: "26"
      - option "Choose martes, 27 de mayo de 2025": "27"
      - option "Choose miércoles, 28 de mayo de 2025": "28"
      - option "Choose jueves, 29 de mayo de 2025": "29"
      - option "Choose viernes, 30 de mayo de 2025": "30"
      - option "Choose sábado, 31 de mayo de 2025": "31"
      - option "Choose domingo, 1 de junio de 2025": "1"
  - text: Fecha de Fin *
  - textbox "Seleccione fecha de fin"
  - text: Motivo *
  - textbox "Describa el motivo de su solicitud..."
  - heading "Documentación Adjunta" [level=2]:
    - img
    - text: Documentación Adjunta
  - text: Adjuntar Documento (opcional)
  - img
  - text: Seleccionar archivo Ningún archivo seleccionado
  - paragraph: "Formatos aceptados: PDF, PNG, JPG, JPEG (Máx. 10MB)"
  - heading "Declaración y Confirmación" [level=3]
  - paragraph: "\"Declaro que la información proporcionada es correcta y entiendo que la aprobación de esta licencia está sujeta a las políticas de la empresa.\""
  - checkbox "Acepto la declaración"
  - text: Acepto la declaración
  - link "Cancelar":
    - /url: /licenses
  - button "Enviar Solicitud"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { login } from './utils/login.js';
   3 |
   4 | test('Empleado pide licencia Nacimiento de hijo 2 dias', async ({ page }) => {
   5 |   // Login como empleado
   6 |   await login(page, 'empleado@gmail.com', '123456');
   7 |   await expect(page).toHaveURL('http://localhost:5173/employee');
   8 |
   9 |   // Ir a la sección Licencias
  10 |   await page.locator('text=Solicitar Licencia').click();
  11 |
  12 |   // Seleccionar tipo de licencia (por ejemplo, Nacimiento de hijo)
  13 |   await page.selectOption('select[name="licenseTypeId"]', '2');
  14 |
  15 |   // Fecha de inicio: hoy (26)
  16 |   await page.getByPlaceholder('Seleccione fecha de inicio').click();
> 17 |   await page.locator('.react-datepicker__day--026:not(.react-datepicker__day--outside-month)').click();
     |                                                                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 |
  19 |   // Fecha de fin: pasado mañana (28)
  20 |   await page.getByPlaceholder('Seleccione fecha de fin').click();
  21 |   await page.locator('.react-datepicker__day--027:not(.react-datepicker__day--outside-month)').click();
  22 |
  23 |   // Motivo
  24 |   await page.fill('textarea[name="reason"]', 'Motivo de la solicitud: vacaciones familiares.');
  25 |
  26 |   // Marcar el checkbox de declaración
  27 |   await page.check('input[name="declaration"]');
  28 |
  29 |   // Enviar solicitud
  30 |   await page.click('button:has-text("Enviar Solicitud")');
  31 |
  32 |   await page.waitForTimeout(3000);
  33 |   
  34 | // Verificar que redirige a la URL esperada
  35 |   await expect(page).toHaveURL('http://localhost:5173/licenses');
  36 |
  37 | });
  38 |
```