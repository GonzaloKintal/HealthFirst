

import { useEffect, useState } from 'react';

const RequestLicense = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
    };

    updateTheme();

    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        updateTheme();
      }
    };

    const handleThemeChange = () => updateTheme();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const imageBasePath = `/images/guides/${theme}`

  return (
    <>
      <p className="mt-1 text-sm text-foreground">
        Procedimiento para empleados que necesitan solicitar licencias.
      </p>
      <br />

      <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
        <img src={`${imageBasePath}/welcome.png`} alt="Bienvenida" className='mt-2' />
        <br />
        <br />

        Paso 1: Accede a la sección de solicitudes de licencia en el sistema.
        <img src={`${imageBasePath}/license-step-1.png`} alt="Paso 1" className='mt-2' />
        <br />
        <br />

        Paso 2: Se observará un formulario para completar los detalles de la licencia.
        <img src={`${imageBasePath}/license-step-2.png`} alt="Paso 2" className='mt-2' />
        <br />
        <br />

        Paso 3: Completa el formulario con la información requerida, incluyendo el tipo de licencia y las fechas.
        <img src={`${imageBasePath}/license-step-3.png`} alt="Paso 3" className='mt-2' />
        <br />
        <br />

        Paso 4: Adjuntar cualquier documento necesario, como certificados médicos o justificantes.
        <img src={`${imageBasePath}/license-step-4.png`} alt="Paso 4" className='mt-2' />
        <br />
        <br />

        Paso 5: Ya solicitaste tu licencia. Será revisada por un supervisor o administrador del sistema.
        <img src={`${imageBasePath}/license-step-5.png`} alt="Paso 5" className='mt-2' />
        <br />
        <br />

        ¡Muchas gracias!
        <img src={`${imageBasePath}/gratitude.png`} alt="Agradecimiento" className='mt-2' />
      </p>
    </>
  );
};

export default RequestLicense;