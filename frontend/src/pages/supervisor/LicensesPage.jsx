// import { useState, useEffect } from 'react';
// import { FiSearch, FiFilter, FiDownload, FiClock, FiCheck, FiX } from 'react-icons/fi';
// import useAuth from '../../hooks/useAuth';

// const LicensesPage = () => {
//   const { user } = useAuth();
//   const [licenses, setLicenses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

//   // Datos de ejemplo - reemplazar con llamada API real
//   useEffect(() => {
//     const mockLicenses = [
//       {
//         id: 1,
//         employee: 'Juan Pérez',
//         type: 'Enfermedad',
//         startDate: '2023-06-15',
//         endDate: '2023-06-20',
//         days: 5,
//         status: 'approved',
//         requestedOn: '2023-06-10'
//       },
//       {
//         id: 2,
//         employee: 'María Gómez',
//         type: 'Vacaciones',
//         startDate: '2023-07-01',
//         endDate: '2023-07-15',
//         days: 14,
//         status: 'pending',
//         requestedOn: '2023-06-25'
//       },
//       {
//         id: 3,
//         employee: 'Carlos Ruiz',
//         type: 'Maternidad',
//         startDate: '2023-08-01',
//         endDate: '2023-11-01',
//         days: 90,
//         status: 'approved',
//         requestedOn: '2023-07-20'
//       },
//       {
//         id: 4,
//         employee: 'Ana López',
//         type: 'Doctor',
//         startDate: '2023-06-18',
//         endDate: '2023-06-18',
//         days: 1,
//         status: 'rejected',
//         requestedOn: '2023-06-15',
//         rejectionReason: 'Falta de documentación'
//       }
//     ];

//     setLicenses(mockLicenses);
//   }, []);

//   const filteredLicenses = licenses.filter(license => {
//     const matchesSearch = license.employee.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filter === 'all' || license.status === filter;
//     return matchesSearch && matchesFilter;
//   });

//   const handleApprove = (id) => {
//     setLicenses(licenses.map(license => 
//       license.id === id ? {...license, status: 'approved'} : license
//     ));
//   };

//   const handleReject = (id) => {
//     setLicenses(licenses.map(license => 
//       license.id === id ? {...license, status: 'rejected'} : license
//     ));
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Gestión de Licencias</h1>
//         <div className="flex space-x-3">
//           <button className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md cursor-pointer hover:bg-blue-700 transition duration-200">
//             <FiDownload className="mr-2" />
//             Exportar
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
//         <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
//           <div className="relative flex-grow">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Buscar empleado..."
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <FiFilter className="text-gray-400" />
//             <select 
//               className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             >
//               <option value="all">Todas</option>
//               <option value="pending">Pendientes</option>
//               <option value="approved">Aprobadas</option>
//               <option value="rejected">Rechazadas</option>
//             </select>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredLicenses.map((license) => (
//                 <tr key={license.id} className='text-center'>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-medium text-gray-900">{license.employee}</div>
//                     <div className="text-sm text-gray-500">Solicitado: {license.requestedOn}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{license.type}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {license.startDate} al {license.endDate}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.days}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       license.status === 'approved' 
//                         ? 'bg-green-100 text-green-800' 
//                         : license.status === 'rejected' 
//                           ? 'bg-red-100 text-red-800' 
//                           : 'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {license.status === 'approved' ? 'Aprobada' : 
//                        license.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
//                     </span>
//                     {license.rejectionReason && (
//                       <div className="text-xs text-red-500 mt-1">{license.rejectionReason}</div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     {license.status === 'pending' ? (
//                       <div className="flex space-x-2 justify-center">
//                         <button 
//                           onClick={() => handleApprove(license.id)}
//                           className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 cursor-pointer"
//                           title="Aprobar"
//                         >
//                           <FiCheck size={22} />
//                         </button>
//                         <button 
//                           onClick={() => handleReject(license.id)}
//                           className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
//                           title="Rechazar"
//                         >
//                           <FiX size={22} />
//                         </button>
//                       </div>
//                     ) : (
//                       <span className="text-gray-400">-</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {filteredLicenses.length === 0 && (
//         <div className="text-center py-12 text-gray-500">
//           No se encontraron licencias que coincidan con los filtros
//         </div>
//       )}
//     </div>
//   );
// };

// export default LicensesPage;

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiCheck, FiX, FiEdit, FiTrash2, FiEye, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const LicensesPage = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  // Datos de ejemplo
  useEffect(() => {
    const mockLicenses = [
      {
        id: 1,
        employee: 'Juan Pérez',
        employeeId: 'EMP-001',
        department: 'Ventas',
        position: 'Ejecutivo',
        type: 'Enfermedad',
        startDate: '2023-06-15',
        endDate: '2023-06-20',
        days: 5,
        status: 'approved',
        requestedOn: '2023-06-10',
        reason: 'Gripe con fiebre alta',
        documents: 'certificado_medico.pdf'
      },
      {
        id: 2,
        employee: 'María Gómez',
        employeeId: 'EMP-002',
        department: 'TI',
        position: 'Desarrolladora',
        type: 'Vacaciones',
        startDate: '2023-07-01',
        endDate: '2023-07-15',
        days: 14,
        status: 'pending',
        requestedOn: '2023-06-25',
        reason: 'Vacaciones programadas',
        documents: null
      },
      {
        id: 3,
        employee: 'Carlos Ruiz',
        employeeId: 'EMP-003',
        department: 'RH',
        position: 'Reclutador',
        type: 'Maternidad',
        startDate: '2023-08-01',
        endDate: '2023-11-01',
        days: 90,
        status: 'approved',
        requestedOn: '2023-07-20',
        reason: 'Licencia por paternidad',
        documents: 'documentos_paternidad.pdf'
      },
      {
        id: 4,
        employee: 'Ana López',
        employeeId: 'EMP-004',
        department: 'Contabilidad',
        position: 'Contadora',
        type: 'Doctor',
        startDate: '2023-06-18',
        endDate: '2023-06-18',
        days: 1,
        status: 'rejected',
        requestedOn: '2023-06-15',
        reason: 'Consulta médica',
        documents: null,
        rejectionReason: 'Falta de documentación médica'
      },
    ];

    setLicenses(mockLicenses);
  }, []);

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || license.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (id) => {
    setLicenses(licenses.map(license => 
      license.id === id ? {...license, status: 'approved'} : license
    ));
    setIsModalOpen(false);
    resetRejectionForm();
  };

  const handleReject = (id) => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingrese un motivo de rechazo');
      return;
    }
    setLicenses(licenses.map(license => 
      license.id === id ? {...license, status: 'rejected', rejectionReason} : license
    ));
    setIsModalOpen(false);
    resetRejectionForm();
  };

  const handleEdit = (id) => {
    console.log('Editar licencia con ID:', id);
    // Aquí iría la lógica para editar
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta licencia?')) {
      setLicenses(licenses.filter(license => license.id !== id));
    }
  };

  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
    resetRejectionForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLicense(null);
    resetRejectionForm();
  };

  const resetRejectionForm = () => {
    setRejectionReason('');
    setShowRejectionInput(false);
  };

  return (
    <div className="p-6 relative">
      {/* Modal de Detalle */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Detalle de Licencia</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {selectedLicense && (
                  <div className="space-y-6">
                    {/* Sección de Acciones */}
                    {selectedLicense.status === 'pending' && (
                      <div className="flex flex-col space-y-3 pb-4 border-b border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprove(selectedLicense.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center cursor-pointer"
                          >
                            <FiCheck className="mr-2" /> Aprobar
                          </button>
                          <button
                            onClick={() => setShowRejectionInput(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center cursor-pointer"
                          >
                            <FiX className="mr-2" /> Rechazar
                          </button>
                        </div>

                        {showRejectionInput && (
                          <div className="space-y-2">
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Ingrese el motivo del rechazo..."
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              style={{ resize: 'nonne' }}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleReject(selectedLicense.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm cursor-pointer"
                              >
                                Confirmar Rechazo
                              </button>
                              <button
                                onClick={resetRejectionForm}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Información del Empleado */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <FiUser className="mr-2" /> Información del Empleado
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="font-medium">{selectedLicense.employee}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ID Empleado</p>
                          <p className="font-medium">{selectedLicense.employeeId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Departamento</p>
                          <p className="font-medium">{selectedLicense.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cargo</p>
                          <p className="font-medium">{selectedLicense.position}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detalles de la Licencia */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <FiCalendar className="mr-2" /> Detalles de la Licencia
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Tipo</p>
                          <p className="font-medium capitalize">{selectedLicense.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Días</p>
                          <p className="font-medium">{selectedLicense.days}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Inicio</p>
                          <p className="font-medium">{selectedLicense.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Fin</p>
                          <p className="font-medium">{selectedLicense.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Solicitado el</p>
                          <p className="font-medium">{selectedLicense.requestedOn}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estado</p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedLicense.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : selectedLicense.status === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedLicense.status === 'approved' ? 'Aprobada' : 
                             selectedLicense.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Motivo y Documentos */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Motivo</p>
                        <p className="font-medium">{selectedLicense.reason}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Documentos adjuntos</p>
                        {selectedLicense.documents ? (
                          <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                            <FiFileText className="mr-2" /> {selectedLicense.documents}
                          </a>
                        ) : (
                          <p className="text-gray-400">No hay documentos adjuntos</p>
                        )}
                      </div>

                      {selectedLicense.rejectionReason && (
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Motivo de rechazo</p>
                          <p className="text-red-600">{selectedLicense.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Licencias</h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md cursor-pointer hover:bg-blue-700 transition duration-200">
            <FiDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className='text-center'>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{license.employee}</div>
                    <div className="text-sm text-gray-500">Solicitado: {license.requestedOn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{license.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.startDate} al {license.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.days}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      license.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : license.status === 'rejected' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {license.status === 'approved' ? 'Aprobada' : 
                       license.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(license)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer flex items-center mx-auto"
                      title="Ver detalle"
                    >
                      <FiEye size={18} className="mr-1" />
                      <span>Detalle</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={() => handleEdit(license.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                        title="Editar"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(license.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                        title="Eliminar"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron licencias que coincidan con los filtros
        </div>
      )}
    </div>
  );
};

export default LicensesPage;