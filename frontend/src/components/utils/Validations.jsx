export const validateName = (name) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    return regex.test(name) && name.trim().length >= 2;
  };
  
  export const validateAge = (date) => {
    if (!date) return false;
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };
  
  export const validateDNI = (dni) => {
    // DNI argentino: 7 u 8 dígitos
    return /^\d{7,8}$/.test(dni);
  };
  
  export const validatePhone = (phone) => {
    // Números, entre 10 y 15 dígitos
    return /^\d{10,15}$/.test(phone);
  };
  
  export const validatePassword = (password) => {
    return password.length >= 6;
  };

  export const validateEmail = (email) => {
    // Expresión regular para validar direcciones de correo electrónico
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  