import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Aprobación de licencia con estado Pendiente', async ({ page }) => {
  // 1. Login y navegación
  await login(page, 'supervisor@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/supervisor');
  
  await page.getByText('Licencias', { exact: true }).click();
  await expect(page).toHaveURL('http://localhost:5173/licenses');

  // 2. Buscar filas con estado "Pendiente"
  const filasPendientes = page.locator('tbody tr:has(td:text("Pendiente"))');
  const countPendientes = await filasPendientes.count();

  // 3. Manejo cuando no hay pendientes
  if (countPendientes === 0) {
    console.log('No hay licencias pendientes para aprobar');
    await page.screenshot({ path: 'no-pendientes.png' });
    return; // Finaliza el test exitosamente
  }

  // 4. Seleccionar la primera licencia pendiente
  const filaPendiente = filasPendientes.first();
  const idLicencia = await filaPendiente.locator('td').first().textContent();
  console.log(`Procesando licencia con ID: ${idLicencia}`);

  // Resto del flujo de aprobación...
  await filaPendiente.locator('button[title="Ver detalle"]').click();

  // 5. Primer click en Aprobar
  await page.getByRole('button', { name: 'Aprobar', exact: true }).click();

  // 6. Manejo del modal de confirmación
  try {
    const modal = page.locator('div.bg-white.rounded-lg.shadow-xl');
    await modal.waitFor({ state: 'visible', timeout: 8000 });
    
    await expect(modal.locator('h3:text("Aprobar Licencia")')).toBeVisible();
    
    const botonAprobarModal = modal.locator('button:has-text("Aprobar")');
    await botonAprobarModal.scrollIntoViewIfNeeded();
    await botonAprobarModal.click();
    
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
  } catch (error) {
    await page.screenshot({ path: `error-${idLicencia}.png` });
    throw new Error(`Fallo al aprobar licencia ${idLicencia}: ${error}`);
  }

  // 7. Verificación del cambio de estado
  await expect(async () => {
    await page.reload();
    const filaActualizada = page.locator(`tbody tr:has(td:text("${idLicencia}"))`);
    await expect(filaActualizada.locator('td:text("Aprobada")')).toBeVisible();
  }).toPass({ intervals: [1000, 2000, 5000], timeout: 20000 });

  console.log(`Licencia ${idLicencia} aprobada correctamente`);
});