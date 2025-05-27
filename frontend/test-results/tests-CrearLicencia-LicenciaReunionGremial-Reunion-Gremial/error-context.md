# Test info

- Name: Reunion Gremial
- Location: C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaReunionGremial.spec.js:4:1

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:5173/licenses" until "load"
============================================================
    at C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaReunionGremial.spec.js:47:14
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
    - option "Reunión gremial" [selected]
    - option "Representante gremial"
    - option "Reunión extraordinaria"
    - option "Otros"
  - text: Días Solicitados
  - textbox: 1 día(s)
  - text: Fecha de Inicio *
  - textbox "Seleccione fecha de inicio": 29/05/2025
  - text: Fecha de Fin *
  - textbox "Seleccione fecha de fin": 29/05/2025
  - text: Motivo *
  - textbox "Describa el motivo de su solicitud...": Debo asistir a una reunion gremial.
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
   4 | test('Reunion Gremial', async ({ page }) => {
   5 |   // Login
   6 |   await login(page, 'empleado@gmail.com', '123456');
   7 |   await expect(page).toHaveURL('http://localhost:5173/employee');
   8 |
   9 |   await page.locator('text=Solicitar Licencia').click();
  10 |   await page.selectOption('select[name="licenseTypeId"]', '19'); // Mudanza
  11 |
  12 |   // Función para seleccionar pasado mañana en el datepicker
  13 |   const selectInTwoDays = async () => {
  14 |     const days = page.locator('.react-datepicker__day:not(.react-datepicker__day--outside-month)');
  15 |     const count = await days.count();
  16 |
  17 |     let todayIndex = -1;
  18 |     for (let i = 0; i < count; i++) {
  19 |       if (await days.nth(i).evaluate(el => el.classList.contains('react-datepicker__day--today'))) {
  20 |         todayIndex = i;
  21 |         break;
  22 |       }
  23 |     }
  24 |
  25 |     if (todayIndex === -1 || todayIndex + 3 >= count) {
  26 |       throw new Error('No pude encontrar la fecha en el calendario');
  27 |     }
  28 |
  29 |     // Clic en el día dos días después de hoy
  30 |     await days.nth(todayIndex + 2).click();
  31 |   };
  32 |
  33 |   // Fecha de inicio: pasado mañana
  34 |   await page.getByPlaceholder('Seleccione fecha de inicio').click();
  35 |   await selectInTwoDays();
  36 |
  37 |   // Fecha de fin: pasado mañana
  38 |   await page.getByPlaceholder('Seleccione fecha de fin').click();
  39 |   await selectInTwoDays();
  40 |
  41 |   // Resto del formulario
  42 |   await page.fill('textarea[name="reason"]', 'Debo asistir a una reunion gremial.');
  43 |   await page.check('input[name="declaration"]');
  44 |   await page.click('button:has-text("Enviar Solicitud")');
  45 |
  46 |   // Verificar redirección
> 47 |   await page.waitForURL('http://localhost:5173/licenses');
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  48 |   await expect(page).toHaveURL('http://localhost:5173/licenses');
  49 | });
  50 |
```