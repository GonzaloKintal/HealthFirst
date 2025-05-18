import { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import { updateLicense } from '../../services/licenseService';
import Notification from '../utils/Notification';

const UploadCertificateModal = ({ 
  licenseId, 
  onClose, 
  onUploadSuccess 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Por favor selecciona un archivo'
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const base64File = await readFileAsBase64(selectedFile);

      const requestData = {
        certificate: {
          file: base64File,
          validation: false
        }
      };

      const response = await updateLicense(licenseId, requestData);
      
      if (response.success) {
        onUploadSuccess(response.data);
        onClose();
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: response.error || 'Error al cargar el certificado'
        });
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error al cargar el certificado'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-medium mb-4 text-foreground">Subir Certificado Médico</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Seleccionar archivo (PDF o imagen)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-hover
              cursor-pointer"
          />
        </div>

        {notification.show && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification({ show: false, type: '', message: '' })}
          />
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-card text-foreground rounded-md hover:bg-border"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </>
            ) : (
              <>
                <FiUpload className="mr-2" />
                Subir Certificado
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCertificateModal;