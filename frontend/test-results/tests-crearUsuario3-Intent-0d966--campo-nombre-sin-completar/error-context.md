# Test info

- Name: Intentar ingresar un usuario con campo nombre sin completar
- Location: C:\Users\Juans\HealthFirst\frontend\tests\crearUsuario3.spec.js:4:1

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="employment_start_date"]')

    at C:\Users\Juans\HealthFirst\frontend\tests\crearUsuario3.spec.js:19:12
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
  - 'textbox "Ej: Pérez"'
  - text: DNI *
  - 'textbox "Ej: 12345678"'
  - text: Fecha de Nacimiento *
  - textbox "Seleccione una fecha"
  - text: Teléfono *
  - 'textbox "Ej: 1123456789"'
  - text: Correo Electrónico *
  - 'textbox "Ej: usuario@empresa.com"'
  - text: Departamento *
  - combobox:
    - option "Seleccionar departamento" [selected]
    - option "Administración"
    - option "Recursos Humanos"
    - option "Tecnología"
    - option "Operaciones"
    - option "Ventas"
    - option "Marketing"
    - option "Finanzas"
    - option "Legal"
  - text: Fecha de Ingreso a la Empresa *
  - textbox "Seleccione una fecha"
  - heading "Credenciales de Acceso" [level=2]:
    - img
    - text: Credenciales de Acceso
  - text: Contraseña *
  - textbox "Mínimo 6 caracteres"
  - text: Confirmar Contraseña *
  - textbox "Repite la contraseña"
  - heading "Rol y Permisos" [level=2]:
    - img
    - text: Rol y Permisos
  - text: Rol del Usuario *
  - combobox:
    - option "Administrador"
    - option "Supervisor"
    - option "Analista"
    - option "Empleado" [selected]
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
   4 | test('Intentar ingresar un usuario con campo nombre sin completar', async ({ page }) => {
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
  18 | await page.fill('input[name="last_name"]', '');
> 19 | await page.fill('input[name="employment_start_date"]', '2025-06-01');
     |            ^ Error: page.fill: Test timeout of 30000ms exceeded.
  20 | await page.fill('input[name="dni"]', '12345678');
  21 | await page.fill('input[name="date_of_birth"]', '1990-05-18');
  22 | await page.fill('input[name="email"]', 'empleado3@gmail.com');
  23 | await page.fill('input[name="password"]', '123456');
  24 | await page.fill('input[name="confirmPassword"]', '123456');
  25 | await page.fill('input[name="phone"]', '1109899765');
  26 | await page.selectOption('select[name="department"]', { label: 'Tecnología' });
  27 | await page.selectOption('select[name="role_name"]', { value: 'supervisor' });
  28 | await page.click('button:has-text("Guardar Usuario")');
  29 | // Verifica que la URL actual sea la de usuarios
  30 |  expect(page.url()).toBe('http://localhost:5173/add-user'); 
  31 | });
```