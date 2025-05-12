export async function agregarUsuario(page, datos) {
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await page.click('text=Nuevo Usuario');
    await page.fill('input[name="first_name"]', datos.nombre);
    await page.fill('input[name="last_name"]', datos.apellido);
    await page.fill('input[name="date_of_birth"]', datos.fechaNacimiento);
    await page.selectOption('select[name="department"]', { label: datos.departamento });
    await page.fill('input[name="dni"]', datos.dni);
    await page.fill('input[name="phone"]', datos.telefono);
    await page.fill('input[name="email"]', datos.email);
    await page.fill('input[name="password"]', datos.password);
    await page.fill('input[name="confirmPassword"]', datos.confirmar);
    await page.getByRole('button', { name: 'Guardar Usuario' }).click();
  }
  