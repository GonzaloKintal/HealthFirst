# Test info

- Name: Empleado pide licencia por asistencia a familiares
- Location: C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaAsistenciaFa.spec.js:4:1

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:5173/licenses" until "load"
============================================================
    at C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaAsistenciaFa.spec.js:49:14
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
    - option "Nacimiento de hijo"
    - option "Estudios"
    - option "Maternidad"
    - option "Control prenatal"
    - option "Accidente de trabajo"
    - option "Enfermedad"
    - option "Casamiento" [selected]
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
  - textbox: 2 día(s)
  - text: Fecha de Inicio *
  - textbox "Seleccione fecha de inicio": 27/05/2025
  - text: Fecha de Fin *
  - textbox "Seleccione fecha de fin": 28/05/2025
  - text: Motivo *
  - textbox "Describa el motivo de su solicitud...": Debo cuidar a un familiar enfermo.
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
   4 | test('Empleado pide licencia por asistencia a familiares', async ({ page }) => {
   5 |   // Login como empleado
   6 |   await login(page, 'empleado@gmail.com', '123456');
   7 |   await expect(page).toHaveURL('http://localhost:5173/employee');
   8 |
   9 |   // Ir a la sección Licencias
  10 |   await page.locator('text=Solicitar Licencia').click();
  11 |
  12 |   // Seleccionar tipo de licencia: Asistencia a familiares (asumo ID = 8)
  13 |   await page.selectOption('select[name="licenseTypeId"]', '8');
  14 |
  15 |   // Usamos fecha de hoy para inicio y mañana para fin
  16 |   const today = new Date();
  17 |   const tomorrow = new Date(today);
  18 |   tomorrow.setDate(today.getDate() + 1);
  19 |
  20 |   const formatDay = (date) => String(date.getDate()).padStart(2, '0');
  21 |   const startDay = formatDay(today);
  22 |   const endDay = formatDay(tomorrow);
  23 |
  24 |   const currentMonth = today.getMonth();
  25 |   const endMonth = tomorrow.getMonth();
  26 |
  27 |   // Fecha de inicio
  28 |   await page.getByPlaceholder('Seleccione fecha de inicio').click();
  29 |   await page.locator(`.react-datepicker__day--0${startDay}:not(.react-datepicker__day--outside-month)`).click();
  30 |
  31 |   // Fecha de fin
  32 |   await page.getByPlaceholder('Seleccione fecha de fin').click();
  33 |   if (endMonth > currentMonth) {
  34 |     await page.locator('.react-datepicker__navigation--next').click();
  35 |   }
  36 |   await page.locator(`.react-datepicker__day--0${endDay}:not(.react-datepicker__day--outside-month)`).click();
  37 |
  38 |   // Motivo
  39 |   await page.fill('textarea[name="reason"]', 'Debo cuidar a un familiar enfermo.');
  40 |
  41 |   // Declaración jurada
  42 |   await page.check('input[name="declaration"]');
  43 |
  44 |   // Enviar solicitud
  45 |   await page.waitForTimeout(1000);
  46 |   await page.click('button:has-text("Enviar Solicitud")');
  47 |
  48 |   // Verificar redirección y mensaje de éxito
> 49 |   await page.waitForURL('http://localhost:5173/licenses');
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  50 |   await expect(page).toHaveURL('http://localhost:5173/licenses');
  51 |
  52 | });
  53 |
```