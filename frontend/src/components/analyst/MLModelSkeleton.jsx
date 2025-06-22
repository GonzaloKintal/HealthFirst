import { FiCpu, FiGitBranch } from 'react-icons/fi';

const MLModelsSkeleton = () => {
  return (
    <div className="bg-background p-6 rounded-lg shadow text-foreground">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <FiCpu className="mr-2 text-gray-300 dark:text-gray-600 text-xl" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="mt-6 bg-card rounded-lg shadow">
        <div className="p-6">
          {/* Título del listado */}
          <div className="flex items-center mb-6">
            <FiGitBranch className="mr-2 text-gray-300 dark:text-gray-600" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Filtro */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Tabla */}
          <div className="space-y-6">
            <div className="overflow-x-auto border rounded-lg border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent">
                  <tr>
                    {['Versión', 'Nombre', 'Tipo', 'Algoritmo', 'Estado'].map((header) => (
                      <th key={header} className="px-6 py-3 text-center">
                        <div className="h-4 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4 text-center">
                          <div className="h-4 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="w-full px-6 py-3 border-t border-border bg-card">
              <div className="flex justify-center">
                <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Detalles del modelo */}
            <div className="border rounded-lg p-6 border-border bg-card">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-b border-border pb-4">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="h-10 w-40 mt-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLModelsSkeleton;