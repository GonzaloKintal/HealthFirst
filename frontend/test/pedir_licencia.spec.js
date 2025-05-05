// test/licencia.spec.js
import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta

test('Usuario solicita una licencia correctamente', async ({ page }) => {
  
  await login(page, 'cliente@gmail.com', '1234');  // Iniciar sesión como empleado
  await expect(page).toHaveURL('http://localhost:5173/employee', { timeout: 10000 });


  // Paso 2: Navegar a la página de solicitud de licencia
  await page.click('span.ml-3.font-medium:text("Solicitar Licencia")');


  // Paso 3: Completar los campos del formulario
  await page.selectOption('select[name="licenseType"]', { value: 'Enfermedad' });
  await page.fill('[name="startDate"]', '2025-05-10');
  await page.fill('[name="endDate"]', '2025-05-11');
  await page.type('textarea[name="reason"]', 'Gripe con fiebre alta');  // Simula que el usuario escribe
  await page.check('input[name="declaration"]');


  // Paso 4: Enviar el formulario
  await page.click('button[type="submit"]');

  // quiero que el supervisor se loguee y verifique que la licencia fue solicitada
  await page.waitForTimeout(2000); // Esperar un momento para que la solicitud se procese
  await login(page, 'supervisor@gmail.com', '1234');  // Iniciar sesión como empleado
  await expect(page).toHaveURL('http://localhost:5173/supervisor', { timeout: 10000 });

});
