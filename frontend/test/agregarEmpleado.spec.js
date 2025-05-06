import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';
import { agregarUsuario } from './utils/agregarUsuario.js'; // Asegúrate de que la ruta sea correcta

test.describe('Gestión de usuarios', () => {
  test('Crear usuario válido', async ({ page }) => {
    await login(page, 'juansaltiva2000@gmail.com', '1234');
    await agregarUsuario(page, {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'nuevo@mail.com',
      dni: '12345678',
      telefono: '1122334455',
      fechaNacimiento: '1990-01-01',
      departamento: 'Tecnología',
      password: '123456',
      confirmar: '123456'
    });

    await page.goto('http://localhost:5173/user');
  });

  test('Faltan datos obligatorios (Email)', async ({ page }) => {
    await login(page, 'juansaltiva2000@gmail.com', '1234');
    await agregarUsuario(page, {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: '',  // Email vacío
      dni: '12345678',
      telefono: '1122334455',
      fechaNacimiento: '1990-01-01',
      departamento: 'Tecnología',
      password: '123456',
      confirmar: '123456'
    });
  });

  // Agregás así cada caso como nuevo `test(...)` y verificás lo esperado con `expect(...)`
});
