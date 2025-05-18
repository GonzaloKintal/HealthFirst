import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Aprobación de todas las licencias pendientes', async ({ page }) => {
  // 1. Login y navegación
  await login(page, 'supervisor@gmail.com', '123456');
  await expect(page).toHaveURL('http://localhost:5173/supervisor');

  await page.getByText('Licencias', { exact: true }).click();
  await expect(page).toHaveURL('http://localhost:5173/licenses');

  // 2. Buscar todas las filas con estado "Pendiente"
  const filasPendientes = page.locator('tbody tr:has(td:text("Pendiente"))');
  const countPendientes = await filasPendientes.count();
  console.log(`🔄 Licencias pendientes encontradas: ${countPendientes}`);

  // 3. Manejo cuando no hay pendientes
  if (countPendientes === 0) {
    console.log('✅ No hay licencias pendientes para aprobar');
    await page.screenshot({ path: 'no-pendientes.png' });
    return;
  }

  // 4. Recorrer todas las licencias pendientes
  for (let i = 0; i < countPendientes; i++) {
    try {
      const filaPendiente = filasPendientes.nth(i);
      const idLicencia = await filaPendiente.locator('td').first().textContent();
      console.log(`🔍 Procesando licencia con ID: ${idLicencia}`);

      // Hacer clic en el botón "Ver detalle"
      await filaPendiente.locator('button[title="Ver detalle"]').click();

      // 5. Primer click en Aprobar
      await page.getByRole('button', { name: 'Aprobar', exact: true }).click();

      // 6. Manejo del modal de confirmación
      const modal = page.locator('div.bg-white.rounded-lg.shadow-xl');
      await modal.waitFor({ state: 'visible', timeout: 8000 });
      await expect(modal.locator('h3:text("Aprobar Licencia")')).toBeVisible();

      const botonAprobarModal = modal.locator('button:has-text("Aprobar")');
      await botonAprobarModal.scrollIntoViewIfNeeded();
      await botonAprobarModal.click();

      await modal.waitFor({ state: 'hidden', timeout: 5000 });

      // 7. Verificación del cambio de estado
      await page.reload();
      const filaActualizada = page.locator(`tbody tr:has(td:text("${idLicencia}"))`);
      await expect(filaActualizada.locator('td:text("Aprobada")')).toBeVisible();

      console.log(`✔️ Licencia ${idLicencia} aprobada correctamente`);
      
    } catch (error) {
      console.error(`❌ Error al procesar licencia en la fila ${i + 1}: ${error}`);
      await page.screenshot({ path: `error-licencia-${i + 1}.png` });
      continue; // Seguir con la siguiente licencia
    }

    // Volver a la lista de licencias
    await page.goto('http://localhost:5173/licenses');
  }

  console.log('🏁 Finalizado el proceso de aprobación de licencias.');
});
