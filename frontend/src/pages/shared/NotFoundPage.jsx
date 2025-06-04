import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Button } from '@headlessui/react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        
        <div className='flex justify-center mt-6'>
          <Button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Volver atrás</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;