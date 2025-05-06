# Test info

- Name: Se agrega empleado nuevo al sistema
- Location: C:\Users\Juans\HealthFirst\frontend\test\agregarEmpleado.spec.js:5:1

# Error details

```
Error: page.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('input[name="first_name"]')

    at C:\Users\Juans\HealthFirst\frontend\test\agregarEmpleado.spec.js:11:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { login } from './utils/login.js';  // Asegúrate de que la ruta sea correcta
   3 | import { agregarUsuario } from './utils/formularioEmpleado.js'; // Asegúrate de que la ruta sea correcta
   4 |
   5 | test('Se agrega empleado nuevo al sistema', async ({ page }) => {
   6 |     await login(page, 'juansaltiva2000@gmail.com', '1234');
   7 |     await expect(page).toHaveURL('http://localhost:5173/admin', { timeout: 10000 });
   8 |     await page.getByRole('link', { name: 'Usuarios' }).click();
   9 |     await page.click('text=Nuevo Usuario');
  10 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
> 11 |     await page.fill('input[name="first_name"]', 'Carlos');
     |                ^ Error: page.fill: Target page, context or browser has been closed
  12 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
  13 |     await page.fill('input[name="last_name"]', 'Meza');
  14 |     await page.fill('input[name="date_of_birth"]', '1990-05-05');
  15 |     await page.selectOption('select[name="department"]', { label: 'Recursos Humanos' });
  16 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
  17 |     await page.fill('input[name="dni"]', '87654321');
  18 |     await page.fill('input[name="phone"]', '1130537324');
  19 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
  20 |     await page.fill('input[name="email"]', 'cliente2@gmail.com');
  21 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
  22 |     await page.fill('input[name="password"]', '123456');
  23 |     await page.fill('input[name="confirmPassword"]', '123456');
  24 |     await page.click('text=Guardar');
  25 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud  
  26 |
  27 |     await page.getByRole('button', { name: 'Guardar Usuario' }).click();
  28 |     await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
  29 |
  30 |     const successMessage = await page.locator('text=Error al crear el usuario').first();
  31 |     await expect(successMessage).toBeVisible();
  32 |     
  33 |
  34 |   });
```