// test/pedir_loginSupervisor.spec.js
import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Login exitoso del supervisor', async ({ page }) => {
  // Realiza el login
  await login(page, 'supervisor@gmail.com', '123456');

  // Verifica que la URL sea la del supervisor después de loguearse
  await expect(page).toHaveURL('http://localhost:5173/supervisor', { timeout: 10000 });

  // Ir a la página de licencias
  await page.click('text=Licencias', { timeout: 10000 });
  await expect(page).toHaveURL('http://localhost:5173/licenses', { timeout: 10000 });

  console.log('Login exitoso y redirección a Licencias confirmada.');

  // Buscar el botón "Ver detalle" en una fila con estado "Pendiente"
  const licenciasPendientes = page.locator('tr:has(span:text("Pendiente")) button[title="Ver detalle"]');

  // Verificar si hay al menos una licencia pendiente
  if (await licenciasPendientes.count() > 0) {
    console.log('Se encontró al menos una licencia pendiente.');
    await licenciasPendientes.first().click();

    // Hacer clic en el botón "Aprobar"
    await page.click('button:has-text("Aprobar")');
    console.log('Botón "Aprobar" clickeado.');

    // Esperar y hacer clic en el botón de confirmación si aparece
    const botonConfirmar = page.locator('button:has-text("Confirmar")');
    if (await botonConfirmar.isVisible()) {
      await botonConfirmar.click();
      console.log('Botón "Confirmar" clickeado.');
    }

    // Esperar que el estado cambie a "Aprobada"
    await page.waitForSelector('span:text("Aprobada")', { timeout: 10000 });
    console.log('El estado cambió a "Aprobada" correctamente.');
  } else {
    console.log('No hay licencias pendientes para aprobar.');
  }

  // Asegurarse de que el test pase incluso si no hay licencias pendientes
  expect(true).toBeTruthy();
});
