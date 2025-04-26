import { useState, useEffect } from 'react';
import { FiClock, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const MyLicensesPage = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo - reemplazar con llamada API real
  useEffect(() => {
    const mockLicenses = [
      {
        id: 1,
        type: 'Vacaciones',
        startDate: '2023-07-10',
        endDate: '2023-07-20',
        days: 10,
        status: 'approved',
        requestedOn: '2023-06-25',
        approvedBy: 'María Gómez (Supervisora)'
      },
      {
        id: 2,
        type: 'Enfermedad',
        startDate: '2023-08-05',
        endDate: '2023-08-07',
        days: 2,
        status: 'approved',
        requestedOn: '2023-08-01',
        approvedBy: 'María Gómez (Supervisora)'
      },
      {
        id: 3,
        type: 'Asuntos personales',
        startDate: '2023-09-15',
        endDate: '2023-09-15',
        days: 1,
        status: 'pending',
        requestedOn: '2023-09-10'
      },
      {
        id: 4,
        type: 'Doctor',
        startDate: '2023-06-18',
        endDate: '2023-06-18',
        days: 1,
        status: 'rejected',
        requestedOn: '2023-06-15',
        rejectedBy: 'María Gómez (Supervisora)',
        rejectionReason: 'Falta de documentación médica'
      }
    ];

    setLicenses(mockLicenses);
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusText = {
      approved: 'Aprobada',
      pending: 'Pendiente',
      rejected: 'Rechazada'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Licencias</h1>
        <Link
          to="/request-license"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Solicitar Nueva
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr key={license.id} className='text-center'>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                  {license.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.startDate} {license.startDate !== license.endDate && `al ${license.endDate}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.days} día{license.days !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(license.status)}
                  {license.rejectionReason && (
                    <div className="text-xs text-red-500 mt-1">{license.rejectionReason}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>Solicitado: {license.requestedOn}</span>
                    {license.status === 'approved' && (
                      <span>Aprobado por: {license.approvedBy}</span>
                    )}
                    {license.status === 'rejected' && (
                      <span>Rechazado por: {license.rejectedBy}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {licenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes licencias registradas</p>
          <Link
            to="/request-license"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Solicitar tu primera licencia
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyLicensesPage;