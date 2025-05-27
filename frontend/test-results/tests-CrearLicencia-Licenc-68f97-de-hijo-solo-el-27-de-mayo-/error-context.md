# Test info

- Name: Empleado pide licencia Nacimiento de hijo (solo el 27 de mayo)
- Location: C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaControlPrenatal.spec.js:4:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=Éxito! Tu licencia ha sido creada')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=Éxito! Tu licencia ha sido creada')

    at C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\LicenciaControlPrenatal.spec.js:48:28
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
  - heading "Gestión de Licencias" [level=1]:
    - img
    - text: Gestión de Licencias
  - link "Solicitar Nueva":
    - /url: /request-license
    - img
    - text: Solicitar Nueva
  - img
  - combobox:
    - option "Todas" [selected]
    - option "Pendientes"
    - option "Aprobadas"
    - option "Rechazadas"
    - option "Falta certificado"
    - option "Expiradas"
  - table:
    - rowgroup:
      - row "Empleado Tipo Fecha Días Estado Detalle":
        - cell "Empleado"
        - cell "Tipo"
        - cell "Fecha"
        - cell "Días"
        - cell "Estado"
        - cell "Detalle"
    - rowgroup:
      - row "Juan Saltiva Enfermedad 03/06/2025 al 03/07/2025 31 Falta certificado Detalle":
        - cell "Juan Saltiva"
        - cell "Enfermedad"
        - cell "03/06/2025 al 03/07/2025"
        - cell "31"
        - cell "Falta certificado"
        - cell "Detalle":
          - button "Detalle":
            - img
            - text: Detalle
      - row "Juan Saltiva Enfermedad 03/06/2025 al 03/07/2025 31 Falta certificado Detalle":
        - cell "Juan Saltiva"
        - cell "Enfermedad"
        - cell "03/06/2025 al 03/07/2025"
        - cell "31"
        - cell "Falta certificado"
        - cell "Detalle":
          - button "Detalle":
            - img
            - text: Detalle
      - row "Juan Saltiva Maternidad 02/06/2025 al 09/07/2025 38 Falta certificado Detalle":
        - cell "Juan Saltiva"
        - cell "Maternidad"
        - cell "02/06/2025 al 09/07/2025"
        - cell "38"
        - cell "Falta certificado"
        - cell "Detalle":
          - button "Detalle":
            - img
            - text: Detalle
      - row "Juan Saltiva Control prenatal 30/05/2025 al 30/05/2025 1 Falta certificado Detalle":
        - cell "Juan Saltiva"
        - cell "Control prenatal"
        - cell "30/05/2025 al 30/05/2025"
        - cell "1"
        - cell "Falta certificado"
        - cell "Detalle":
          - button "Detalle":
            - img
            - text: Detalle
      - row "Juan Saltiva Control prenatal 30/05/2025 al 30/05/2025 1 Falta certificado Detalle":
        - cell "Juan Saltiva"
        - cell "Control prenatal"
        - cell "30/05/2025 al 30/05/2025"
        - cell "1"
        - cell "Falta certificado"
        - cell "Detalle":
          - button "Detalle":
            - img
            - text: Detalle
  - navigation:
    - button "Anterior" [disabled]:
      - img
      - text: Anterior
    - button "1"
    - button "2"
    - button "3"
    - button "4"
    - button "5"
    - button "6"
    - button "Siguiente":
      - text: Siguiente
      - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { login } from './utils/login.js';
   3 |
   4 | test('Empleado pide licencia Nacimiento de hijo (solo el 27 de mayo)', async ({ page }) => {
   5 |   // Login como empleado
   6 |   await login(page, 'empleado@gmail.com', '123456');
   7 |   await expect(page).toHaveURL('http://localhost:5173/employee');
   8 |
   9 |   // Ir a la sección Licencias
  10 |   await page.locator('text=Solicitar Licencia').click();
  11 |
  12 |   // Seleccionar tipo de licencia (Nacimiento de hijo)
  13 |   await page.selectOption('select[name="licenseTypeId"]', '5');
  14 |
  15 |   // Fecha de inicio: 27 de mayo
  16 |   await page.getByPlaceholder('Seleccione fecha de inicio').click();
  17 |   // Si hoy no es mayo, avanzar hasta mayo
  18 |   const currentMonth = new Date().getMonth(); // 0 = enero
  19 |   const targetMonth = 4; // mayo es mes 4 (0-indexado)
  20 |   for (let i = 0; i < targetMonth - currentMonth; i++) {
  21 |     await page.locator('.react-datepicker__navigation--next').click();
  22 |   }
  23 |   await page.locator('.react-datepicker__day--030:not(.react-datepicker__day--outside-month)').click();
  24 |
  25 |   // Fecha de fin: 27 de mayo
  26 |   await page.getByPlaceholder('Seleccione fecha de fin').click();
  27 |   for (let i = 0; i < targetMonth - currentMonth; i++) {
  28 |     await page.locator('.react-datepicker__navigation--next').click();
  29 |   }
  30 |   await page.locator('.react-datepicker__day--030:not(.react-datepicker__day--outside-month)').click();
  31 |
  32 |   // Motivo
  33 |   await page.fill('textarea[name="reason"]', 'Motivo de la solicitud: nacimiento de hijo.');
  34 |
  35 |   // Marcar el checkbox
  36 |   await page.check('input[name="declaration"]');
  37 |
  38 |   // Enviar solicitud
  39 |   await page.waitForTimeout(3000);
  40 |   await page.click('button:has-text("Enviar Solicitud")');
  41 |
  42 |   // Verificar redirección
  43 |   await page.waitForURL('http://localhost:5173/licenses');
  44 |   await expect(page).toHaveURL('http://localhost:5173/licenses');
  45 |
  46 |   // Verificar cartel de éxito
  47 |   const successMsg = page.locator('text=Éxito! Tu licencia ha sido creada');
> 48 |   await expect(successMsg).toBeVisible();
     |                            ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  49 | });
  50 |
```