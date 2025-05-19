import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Login correcto supervisor', async ({ page }) => {
  await login(page, 'supervisor@gmail.com', '123456');
});
