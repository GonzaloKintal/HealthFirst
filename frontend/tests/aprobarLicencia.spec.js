// test/pedir_loginSupervisor.spec.js
import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta

test('Login exitoso del supervisor', async ({ page }) => {
  // Realiza el login
  await login(page, 'supervisor@gmail.com', '123456');
  
  // Verifica que la URL sea la del supervisor después de loguearse
  await expect(page).toHaveURL('http://localhost:5173/supervisor', { timeout: 10000 });
  
  // Verifica que después de hacer clic en 'Licencias', la URL sea la correcta
  await page.click('text=Licencias', {timeout: 10000});
  await expect(page).toHaveURL('http://localhost:5173/licenses', { timeout: 10000 });

  // Si todo es correcto, muestra un mensaje de éxito
  console.log('Login exitoso y redirección a Licencias confirmada.');

  // Hacer clic en el botón "Ver detalle" en la fila con estado "Pendiente"
  await page.click('tr:has(span:text("Pendiente")) button[title="Ver detalle"]');

  // Hacer clic en el botón que contiene el texto "Aprobar"
await page.click('button:has-text("Aprobar")');

/// Hacer clic en el botón con el tipo "button" y la clase específica
await page.click('button[type="button"].bg-blue-600.hover:bg-blue-700');




});
