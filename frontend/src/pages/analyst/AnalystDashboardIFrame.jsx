import { useEffect, useState } from 'react';

const AnalystDashboardIFrame = () => {
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/metabase/signed-url/', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setIframeUrl(data.iframeUrl);
      })
      .catch((err) => {
        console.error('Error fetching Metabase URL:', err);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard del Analista</h2>
      {iframeUrl ? (
        <iframe
        src={iframeUrl}
        width="100%"
        height="1000"
        allowTransparency
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
        ) : (
        <p>Cargando dashboard...</p>
        )}
    </div>
  );
};

export default AnalystDashboardIFrame;