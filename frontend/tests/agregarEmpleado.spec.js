import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';
import { agregarUsuario } from './utils/agregarUsuario.js';

// Datos de usuario base que son válidos
const usuarioValido = {
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'nuevo@mail.com',
  dni: '12345678',
  telefono: '1122334455',
  fechaNacimiento: '1990-01-01',
  departamento: 'Tecnología',
  password: '123456',
  confirmar: '123456'
};

test.describe('Validación de campos al crear usuario', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'juansaltiva2000@gmail.com', '1234');
  });

  test('Crear usuario con todos los campos válidos', async ({ page }) => {
    await agregarUsuario(page, usuarioValido);
    
    // Verificar que el usuario fue creado exitosamente
    await page.goto('http://localhost:5173/user');
    await expect(page.getByText(usuarioValido.email)).toBeVisible();
  });

  // Test para cada campo obligatorio
  const camposObligatorios = ['nombre', 'apellido', 'email', 'dni', 'telefono', 'fechaNacimiento', 'departamento', 'password', 'confirmar'];
  
  for (const campo of camposObligatorios) {
    test(`Falta campo obligatorio: ${campo}`, async ({ page }) => {
      const usuarioInvalido = {...usuarioValido};
      usuarioInvalido[campo] = ''; // Vaciamos el campo a testear
      
      await agregarUsuario(page, usuarioInvalido);
      
      // Verificar que se muestra mensaje de error
      await expect(page.getByText(`El campo ${campo} es obligatorio`).first()).toBeVisible();
      
      // Opcional: Verificar que no se redirige
      await expect(page).not.toHaveURL('http://localhost:5173/user');
    });
  }

  test('Contraseñas no coinciden', async ({ page }) => {
    await agregarUsuario(page, {
      ...usuarioValido,
      confirmar: 'otracontraseña'
    });
    
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
  });

  test('Formato de email inválido', async ({ page }) => {
    await agregarUsuario(page, {
      ...usuarioValido,
      email: 'emailinvalido'
    });
    
    await expect(page.getByText('El email no tiene un formato válido')).toBeVisible();
  });
});
