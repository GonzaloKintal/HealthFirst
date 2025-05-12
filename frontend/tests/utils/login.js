// test/utils/login.js
export async function login(page, username, password) {
  await page.goto('http://localhost:5173/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}
