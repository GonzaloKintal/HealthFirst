import { useState } from 'react';
import PropTypes from 'prop-types';

const FileValidator = ({ children, onValidation }) => {
    const [error, setError] = useState(null);
  
    const validateFile = (file) => {
      setError(null);
      
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
  
      if (!file) {
        onValidation({ isValid: true });
        return true;
      }
  
      if (!validTypes.includes(file.type)) {
        const errorMsg = 'Formato no válido. Solo PDF, PNG, JPG o JPEG.';
        setError(errorMsg);
        onValidation({ isValid: false, error: errorMsg });
        return false;
      }
  
      if (file.size > maxSize) {
        const errorMsg = 'Archivo demasiado grande. Máximo 10MB.';
        setError(errorMsg);
        onValidation({ isValid: false, error: errorMsg });
        return false;
      }
  
      onValidation({ isValid: true });
      return true;
    };
  
    return children({ validateFile, error });
  };

export default FileValidator;

FileValidator.propTypes = {
  children: PropTypes.func.isRequired,
  onValidation: PropTypes.func.isRequired
};