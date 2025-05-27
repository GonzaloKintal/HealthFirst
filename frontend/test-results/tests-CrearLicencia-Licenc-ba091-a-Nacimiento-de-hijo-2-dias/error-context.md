# Test info

- Name: Empleado pide licencia Nacimiento de hijo 2 dias
- Location: C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaVacaciones.spec.js:4:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:5173/licenses"
Received string: "http://localhost:5173/request-license"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://localhost:5173/request-license"

    at C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaVacaciones.spec.js:37:22
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
    - option "Vacaciones" [selected]
    - option "Nacimiento de hijo"
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
  - textbox: 38 día(s)
  - text: Fecha de Inicio *
  - textbox "Seleccione fecha de inicio": 02/06/2025
  - text: Fecha de Fin *
  - textbox "Seleccione fecha de fin": 09/07/2025
  - text: Motivo *
  - textbox "Describa el motivo de su solicitud...": "Motivo de la solicitud: vacaciones familiares."
  - heading "Documentación Adjunta" [level=2]:
    - img
    - text: Documentación Adjunta
  - text: Adjuntar Documento (opcional)
  - img
  - text: Seleccionar archivo Ningún archivo seleccionado
  - paragraph: "Formatos aceptados: PDF, PNG, JPG, JPEG (Máx. 10MB)"
  - heading "Declaración y Confirmación" [level=3]
  - paragraph: "\"Declaro que la información proporcionada es correcta y entiendo que la aprobación de esta licencia está sujeta a las políticas de la empresa.\""
  - checkbox "Acepto la declaración" [checked]
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
  13 |   await page.selectOption('select[name="licenseTypeId"]', '1');
  14 |
  15 |   // Fecha de inicio: 2 de junio
  16 | await page.getByPlaceholder('Seleccione fecha de inicio').click();
  17 | await page.locator('.react-datepicker__navigation--next').click(); // Ir a junio
  18 | await page.locator('.react-datepicker__day--002:not(.react-datepicker__day--outside-month)').click();
  19 |
  20 | // Fecha de fin: 9 de junio
  21 | await page.getByPlaceholder('Seleccione fecha de fin').click();
  22 | await page.locator('.react-datepicker__navigation--next').click(); // Ir a junio
  23 | await page.locator('.react-datepicker__day--009:not(.react-datepicker__day--outside-month)').click();
  24 |
  25 |
  26 |   // Motivo
  27 |   await page.fill('textarea[name="reason"]', 'Motivo de la solicitud: vacaciones familiares.');
  28 |
  29 |   // Marcar el checkbox de declaración
  30 |   await page.check('input[name="declaration"]');
  31 |
  32 |   // Enviar solicitud
  33 |   await page.click('button:has-text("Enviar Solicitud")');
  34 |
  35 |   await page.waitForTimeout(5000);
  36 | // Verificar que redirige a la URL esperada
> 37 |   await expect(page).toHaveURL('http://localhost:5173/licenses');
     |                      ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  38 |   
  39 | });
  40 |
```