import { test, expect } from '@playwright/test';
import { login } from './utils/login.js';

await login(page, 'empleado@gmail.com', '123456');