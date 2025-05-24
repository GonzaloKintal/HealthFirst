import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Realiza un login correcto con un usuario', async ({ page }) => {
  await login(page, 'empleado@gmail.com', '123456');
  });
