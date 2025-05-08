# Test info

- Name: Login exitoso del supervisor
- Location: C:\Users\Juans\HealthFirst\frontend\test\loginSupervisor.spec.js:5:1

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:5173/supervisor/licencias"
Received string: "http://localhost:5173/licenses"
Call log:
  - expect.toHaveURL with timeout 10000ms
  - waiting for locator(':root')
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/licenses"

    at C:\Users\Juans\HealthFirst\frontend\test\loginSupervisor.spec.js:9:22
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
      - link "Licencias":
        - /url: /licenses
        - img
        - text: Licencias
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
  - button "J Juan Supervisor":
    - text: J Juan Supervisor
    - img
- main:
  - heading "Gestión de Licencias" [level=1]
  - link "Solicitar Nueva":
    - /url: /request-license
    - img
    - text: Solicitar Nueva
  - button "Exportar":
    - img
    - text: Exportar
  - img
  - textbox "Buscar empleado..."
  - img
  - combobox:
    - option "Todas" [selected]
    - option "Pendientes"
    - option "Aprobadas"
    - option "Rechazadas"
  - table:
    - rowgroup:
      - row "Empleado Tipo Fecha Días Estado Detalle Acciones":
        - cell "Empleado"
        - cell "Tipo"
        - cell "Fecha"
        - cell "Días"
        - cell "Estado"
        - cell "Detalle"
        - cell "Acciones"
    - rowgroup
  - text: No se encontraron licencias que coincidan con los filtros
```

# Test source

```ts
   1 | // test/pedir_loginSupervisor.spec.js
   2 | import { test, expect } from '@playwright/test';
   3 | import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta
   4 |
   5 | test('Login exitoso del supervisor', async ({ page }) => {
   6 |   await login(page, 'supervisor@gmail.com', '1234');
   7 |   await expect(page).toHaveURL('http://localhost:5173/supervisor', { timeout: 10000 });
   8 |   await page.click('text=Licencias'),{timeout: 10000};
>  9 |   await expect(page).toHaveURL('http://localhost:5173/supervisor/licencias', { timeout: 10000 });
     |                      ^ Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)
  10 |
  11 | });
  12 |
```