# Test info

- Name: Aprobación de todas las licencias pendientes
- Location: C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\aprobarLicencia.spec.js:4:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:5173/supervisor"
Received string: "http://localhost:5173/login"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://localhost:5173/login"

    at C:\Users\Juans\HealthFirst\frontend\tests\CrearLicencia\aprobarLicencia.spec.js:7:22
```

# Page snapshot

```yaml
- button "Activar dark mode":
  - img
- img "Logo ProHealth"
- heading "Bienvenido a" [level=1]
- heading "HealthFirst" [level=2]
- paragraph: La plataforma integral que combina gestión de licencias médicas con inteligencia predictiva. Optimiza procesos, reduce tiempos de aprobación y ofrece dashboards inteligentes para una toma de decisiones estratégica en bienestar laboral.
- img
- img
- heading "Iniciar sesión" [level=2]
- paragraph: Ingresa tus credenciales para acceder al sistema
- text: Credenciales incorrectas. Por favor, inténtelo de nuevo. Usuario
- img
- textbox "Usuario": supervisor@gmail.com
- text: Contraseña
- img
- textbox "Contraseña": "123456"
- button:
  - img
- button "Ingresar"
- button "Acceso Rápido Admin"
- paragraph: Solo disponible en entorno de desarrollo
- paragraph:
  - text: ¿No tienes una cuenta? Contacta con el
  - strong: administrador
  - text: para obtener acceso.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { login } from './utils/login.js';
   3 |
   4 | test('Aprobación de todas las licencias pendientes', async ({ page }) => {
   5 |   // 1. Login y navegación
   6 |   await login(page, 'supervisor@gmail.com', '123456');
>  7 |   await expect(page).toHaveURL('http://localhost:5173/supervisor');
     |                      ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
   8 |
   9 |   await page.getByText('Licencias', { exact: true }).click();
  10 |   await expect(page).toHaveURL('http://localhost:5173/licenses');
  11 |
  12 |   // 2. Buscar todas las filas con estado "Pendiente"
  13 |   const filasPendientes = page.locator('tbody tr:has(td:text("Pendiente"))');
  14 |   const countPendientes = await filasPendientes.count();
  15 |   console.log(`🔄 Licencias pendientes encontradas: ${countPendientes}`);
  16 |
  17 |   // 3. Manejo cuando no hay pendientes
  18 |   if (countPendientes === 0) {
  19 |     console.log('✅ No hay licencias pendientes para aprobar');
  20 |     await page.screenshot({ path: 'no-pendientes.png' });
  21 |     return;
  22 |   }
  23 |
  24 |   // 4. Recorrer todas las licencias pendientes
  25 |   for (let i = 0; i < countPendientes; i++) {
  26 |     try {
  27 |       const filaPendiente = filasPendientes.nth(i);
  28 |       const idLicencia = await filaPendiente.locator('td').first().textContent();
  29 |       console.log(`🔍 Procesando licencia con ID: ${idLicencia}`);
  30 |
  31 |       // Hacer clic en el botón "Ver detalle"
  32 |       await filaPendiente.locator('button[title="Ver detalle"]').click();
  33 |
  34 |       // 5. Primer click en Aprobar
  35 |       await page.getByRole('button', { name: 'Aprobar', exact: true }).click();
  36 |
  37 |       // 6. Manejo del modal de confirmación
  38 |       const modal = page.locator('div.bg-white.rounded-lg.shadow-xl');
  39 |       await modal.waitFor({ state: 'visible', timeout: 8000 });
  40 |       await expect(modal.locator('h3:text("Aprobar Licencia")')).toBeVisible();
  41 |
  42 |       const botonAprobarModal = modal.locator('button:has-text("Aprobar")');
  43 |       await botonAprobarModal.scrollIntoViewIfNeeded();
  44 |       await botonAprobarModal.click();
  45 |
  46 |       await modal.waitFor({ state: 'hidden', timeout: 5000 });
  47 |
  48 |       // 7. Verificación del cambio de estado
  49 |       await page.reload();
  50 |       const filaActualizada = page.locator(`tbody tr:has(td:text("${idLicencia}"))`);
  51 |       await expect(filaActualizada.locator('td:text("Aprobada")')).toBeVisible();
  52 |
  53 |       console.log(`✔️ Licencia ${idLicencia} aprobada correctamente`);
  54 |       
  55 |     } catch (error) {
  56 |       console.error(`❌ Error al procesar licencia en la fila ${i + 1}: ${error}`);
  57 |       await page.screenshot({ path: `error-licencia-${i + 1}.png` });
  58 |       continue; // Seguir con la siguiente licencia
  59 |     }
  60 |
  61 |     // Volver a la lista de licencias
  62 |     await page.goto('http://localhost:5173/licenses');
  63 |   }
  64 |
  65 |   console.log('🏁 Finalizado el proceso de aprobación de licencias.');
  66 | });
  67 |
```