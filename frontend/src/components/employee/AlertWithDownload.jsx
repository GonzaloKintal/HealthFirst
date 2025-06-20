import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { downloadCertificateTemplate } from '../../services/licenseService';

const AlertWithDownload = ({ onDownload }) => {
  const [disabled, setDisabled] = useState(false);

  const handleDownload = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  setDisabled(true);

  try {
      const result = await downloadCertificateTemplate();
      
      if (result.success && onDownload) {
        onDownload();
      } else if (!result.success) {
        throw new Error(result.error || 'Error al descargar el formato');
      }
    } catch (error) {
      console.error("Error al descargar el formato:", error);
    } finally {
      setDisabled(false);
    }
};

  return (
    <div className="bg-yellow-50 dark:bg-yellow-700 dark:bg-opacity-20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-4 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Importante</h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              Antes de cargar el certificado, verifique que no contenga información sensible o datos personales innecesarios.
              La empresa no se hace responsable por la información incluida en el documento adjuntado.
            </p>
            <p className="mb-3">
              Para mayor seguridad y claridad, recomendamos utilizar el formato de certificado provisto por HealthFirst.
            </p>
            <button
              type='button'
              onClick={handleDownload}
              disabled={disabled}
              className={`inline-flex items-center px-3 py-1 border rounded-md shadow-sm text-sm font-medium
                ${
                  disabled
                    ? 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    : 'border-yellow-400 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:border-yellow-600 dark:text-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700'
                }
              `}
            >
              <FiDownload className="mr-2" />
              Descargar formato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertWithDownload;