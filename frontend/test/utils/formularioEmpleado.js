export async function agregarUsuario(page,nombre,apellido,fechaNacimiento,departamento,dni,telefono,email,password) {
    await expect(page).toHaveURL('http://localhost:5173/admin', { timeout: 10000 });
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await page.click('text=Nuevo Usuario');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
    await page.fill('input[name="first_name"]', 'Carlos');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
    await page.fill('input[name="last_name"]', 'Meza');
    await page.fill('input[name="date_of_birth"]', '1990-05-05');
    await page.selectOption('select[name="department"]', { label: 'Recursos Humanos' });
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
    await page.fill('input[name="dni"]', '87654321');
    await page.fill('input[name="phone"]', '1130537324');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
    await page.fill('input[name="email"]', 'cliente2@gmail.com');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud
    await page.fill('input[name="password"]', '123456');
    await page.fill('input[name="confirmPassword"]', '123456');
    await page.click('text=Guardar');
    await page.waitForTimeout(1000); // Espera 2 segundos para que se procese la solicitud  
    }