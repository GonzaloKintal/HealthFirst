const LicenseDetailSkeleton = () => {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
  
        <div className="bg-background rounded-lg shadow overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Skeleton para la sección de acciones */}
            <div className="flex space-x-3 pb-4 border-b border-border">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
  
            {/* Skeleton para la información del empleado */}
            <div className="bg-card p-4 rounded-lg">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Skeleton para los detalles de la licencia */}
            <div className="bg-card p-4 rounded-lg">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Skeleton para la justificación */}
            <div className="bg-card p-4 rounded-lg shadow">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
              <div className="space-y-4">
                <div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
  
            {/* Skeleton para los botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default LicenseDetailSkeleton;