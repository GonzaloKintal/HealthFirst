import { useState } from 'react';
import { sendPersonalizedMessage } from '../../services/messagingService';
import EmployeeSelector from './EmployeeSelector';

const SendMessageForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    selectedEmployee: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.selectedEmployee || !formData.subject || !formData.message) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await sendPersonalizedMessage(
        formData.selectedEmployee,
        formData.subject,
        formData.message
      );
      
      if (response.success) {
        setFormData({
          selectedEmployee: '',
          subject: '',
          message: ''
        });
        onSuccess();
      } else {
        setError(response.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      setError('Error al enviar el mensaje');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <EmployeeSelector 
        selectedEmployee={formData.selectedEmployee}
        onEmployeeSelected={(value) => setFormData(prev => ({ ...prev, selectedEmployee: value }))}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Asunto *
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Mensaje *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground min-h-[150px]"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </div>
    </form>
  );
};

export default SendMessageForm;