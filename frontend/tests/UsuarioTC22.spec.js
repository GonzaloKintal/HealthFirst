import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Crear usuario válido  (Teléfono al borde inferior de clase válida )', async ({ page }) => {
  await login(page, 'admin@admin.com', '123456');
    await expect(page).toHaveURL('http://localhost:5173/admin');

// apreta boton para ingresar a las seccion de usuarios 
  const userButton = await page.locator('span.ml-3.font-medium', { hasText: 'Usuarios' });
  await userButton.click();
// hacemos click en botoin de crear usuario
await page.click('text=Nuevo Usuario');
// debemos cargar los datos 


// Luego usas ese objeto para llenar el formulario:
await page.fill('input[name="first_name"]', 'Juan');
await page.fill('input[name="last_name"]', 'Saltiva');
  const randomDNI = Math.floor(10000000 + Math.random() * 90000000).toString();
  await page.fill('input[name="dni"]', randomDNI);

/// Paso 1: Hacer clic en el campo de fecha para abrir el calendario
await page.getByPlaceholder('Seleccione una fecha').first().click();

// Paso 2: Hacer clic explícito en el contenedor del selector de año para que se despliegue
await page.click('.react-datepicker__year-dropdown-container--select');

// Paso 3: Ahora que el <select> está renderizado, seleccionás el año deseado
await page.selectOption('select.react-datepicker__year-select', '2000');

// Paso 4: Seleccionás el día 19 (asegurándote de que no sea de otro mes)
await page.locator('.react-datepicker__day--023:not(.react-datepicker__day--outside-month)').click();



await page.fill('input[name="email"]', 'TC22@gmail.com');
await page.fill('input[name="password"]', '123456');
await page.fill('input[name="confirmPassword"]', '123456');
await page.fill('input[name="phone"]', '1000000000');
// Fecha de Ingreso a la Empresa
await page.getByPlaceholder('Seleccione una fecha').nth(1).click(); // Usa .first() si hay dos iguales
// Esperar a que aparezca el mes y año esperados
await expect(page.locator('.react-datepicker__current-month')).toHaveText(/mayo 2025/i);
// Seleccionar el día 19 (asegurate de que no tenga clases de fuera de mes como --outside-month)
await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();

await page.selectOption('select[name="department"]', { label: 'Tecnología' });
await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
await page.click('button:has-text("Guardar Usuario")');
// Espera a que la URL cambie a la página de usuarios
  await page.waitForURL('http://localhost:5173/users', { timeout: 5000 });
// Verifica que la URL actual sea la de usuarios
  await expect(page).toHaveURL('http://localhost:5173/users');

});
