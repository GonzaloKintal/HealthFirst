# Test info

- Name: Se crea un usuario valido
- Location: C:\Users\Juans\HealthFirst\frontend\tests\UsuarioTC1.spec.js:4:1

# Error details

```
TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:5173/users" until "load"
============================================================
    at C:\Users\Juans\HealthFirst\frontend\tests\UsuarioTC1.spec.js:41:14
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
      - link "Usuarios":
        - /url: /users
        - img
        - text: Usuarios
    - listitem:
      - link "Licencias":
        - /url: /licenses
        - img
        - text: Licencias
    - listitem:
      - link "Indicadores":
        - /url: /metrics
        - img
        - text: Indicadores
    - listitem:
      - link "Modelo ML":
        - /url: /ml-model
        - img
        - text: Modelo ML
    - listitem:
      - link "Mis Datos":
        - /url: /my-data
        - img
        - text: Mis Datos
    - listitem:
      - link "Configuración":
        - /url: /settings
        - img
        - text: Configuración
- paragraph: Powered by VOX DEI SOLUTIONS
- banner:
  - button:
    - img
  - img "Logo ProHealth"
  - heading "HealthFirst" [level=1]
  - button "Activar dark mode":
    - img
  - button "A Admin Administrador":
    - text: A Admin Administrador
    - img
- main:
  - heading "Crear Nuevo Usuario" [level=1]
  - heading "Información Personal" [level=2]:
    - img
    - text: Información Personal
  - text: Nombre *
  - 'textbox "Ej: Luis"': Luis
  - text: Apellido *
  - 'textbox "Ej: Pérez"': flores
  - text: DNI *
  - 'textbox "Ej: 12345678"': "12345678"
  - text: Fecha de Nacimiento *
  - textbox "Seleccione una fecha": 19/05/2025
  - text: Teléfono *
  - 'textbox "Ej: 1123456789"': "1109899765"
  - text: Correo Electrónico *
  - 'textbox "Ej: usuario@empresa.com"': empleado3@gmail.com
  - text: Departamento *
  - combobox:
    - option "Seleccionar departamento"
    - option "Administración"
    - option "Recursos Humanos"
    - option "Tecnología" [selected]
    - option "Operaciones"
    - option "Ventas"
    - option "Marketing"
    - option "Finanzas"
    - option "Legal"
  - text: Fecha de Ingreso a la Empresa *
  - textbox "Seleccione una fecha": 19/05/2025
  - heading "Credenciales de Acceso" [level=2]:
    - img
    - text: Credenciales de Acceso
  - text: Contraseña *
  - textbox "Mínimo 6 caracteres": "123456"
  - text: Confirmar Contraseña *
  - textbox "Repite la contraseña": "123456"
  - heading "Rol y Permisos" [level=2]:
    - img
    - text: Rol y Permisos
  - text: Rol del Usuario *
  - combobox:
    - option "Administrador"
    - option "Supervisor" [selected]
    - option "Analista"
    - option "Empleado"
  - paragraph: Seleccione el nivel de acceso que tendrá este usuario
  - link "Cancelar":
    - /url: /users
  - button "Guardar Usuario":
    - img
    - text: Guardar Usuario
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { login } from './utils/login.js';
   3 |
   4 | test('Se crea un usuario valido', async ({ page }) => {
   5 |   await login(page, 'admin@admin.com', '123456');
   6 |     await expect(page).toHaveURL('http://localhost:5173/admin');
   7 |
   8 | // apreta boton para ingresar a las seccion de usuarios 
   9 |   const userButton = await page.locator('span.ml-3.font-medium', { hasText: 'Usuarios' });
  10 |   await userButton.click();
  11 | // hacemos click en botoin de crear usuario
  12 | await page.click('text=Nuevo Usuario');
  13 | // debemos cargar los datos 
  14 |
  15 |
  16 | // Luego usas ese objeto para llenar el formulario:
  17 | await page.fill('input[name="first_name"]', 'Luis');
  18 | await page.fill('input[name="last_name"]', 'flores');
  19 | await page.fill('input[name="dni"]', '12345678');
  20 | // Abrir el campo de Fecha de Nacimiento
  21 | await page.getByPlaceholder('Seleccione una fecha').first().click(); // Usa .first() si hay dos iguales
  22 | // Esperar a que aparezca el mes y año esperados
  23 | await expect(page.locator('.react-datepicker__current-month')).toHaveText(/mayo 2025/i);
  24 | // Seleccionar el día 19 (asegurate de que no tenga clases de fuera de mes como --outside-month)
  25 | await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();
  26 | await page.fill('input[name="email"]', 'empleado3@gmail.com');
  27 | await page.fill('input[name="password"]', '123456');
  28 | await page.fill('input[name="confirmPassword"]', '123456');
  29 | await page.fill('input[name="phone"]', '1109899765');
  30 | // Fecha de Ingreso a la Empresa
  31 | await page.getByPlaceholder('Seleccione una fecha').nth(1).click(); // Usa .first() si hay dos iguales
  32 | // Esperar a que aparezca el mes y año esperados
  33 | await expect(page.locator('.react-datepicker__current-month')).toHaveText(/mayo 2025/i);
  34 | // Seleccionar el día 19 (asegurate de que no tenga clases de fuera de mes como --outside-month)
  35 | await page.locator('.react-datepicker__day--019:not(.react-datepicker__day--outside-month)').click();
  36 |
  37 | await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  38 | await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
  39 | await page.click('button:has-text("Guardar Usuario")');
  40 | // Espera a que la URL cambie a la página de usuarios
> 41 |   await page.waitForURL('http://localhost:5173/users', { timeout: 5000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
  42 | // Verifica que la URL actual sea la de usuarios
  43 |   await expect(page).toHaveURL('http://localhost:5173/users');
  44 |
  45 | });
  46 |
```