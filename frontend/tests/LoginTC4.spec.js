import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

test('Validar campos requeridos en login', async ({ page }) => {
   await login(page, 'supervisor@gmail.com', '');

  
});

