
import { useEffect, useState } from 'react';

const AdminDashboardIFrame = () => {
  const [iframeUrl, setIframeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/metabase/signed-url/', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
      })
      .then((data) => {
        if (!data.iframeUrl) throw new Error('URL no recibida');
        setIframeUrl(data.iframeUrl);
      })
      .catch((err) => {
        console.error('Error fetching Metabase URL:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  if (!iframeUrl) {
    return (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
        No se pudo cargar el dashboard. Por favor intente más tarde.
      </div>
    );
  }

  return (
    <iframe
      src={iframeUrl}
      width="100%"
      height="1100"
      allowTransparency="true"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
};

export default AdminDashboardIFrame;