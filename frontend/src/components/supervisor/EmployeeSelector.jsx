import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { FiChevronDown, FiX, FiCheck } from 'react-icons/fi';
import { getUsersByFilter } from '../../services/userService';

const EmployeeSelector = ({ 
  selectedEmployee, 
  onEmployeeSelected,
  initialEmployees = [],
  roles = ['employee']
}) => {
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState(initialEmployees);
  const [isSearching, setIsSearching] = useState(false);

  // Función de búsqueda
  const searchEmployees = async (query) => {
    if (!query || query.trim().length < 2) {
      setFilteredEmployees(initialEmployees);
      return;
    }

    setIsSearching(true);
    try {
      const response = await getUsersByFilter(1, query, 10);
      const filtered = response.users.filter(user => 
        roles.includes(user.role)
      );
      setFilteredEmployees(filtered);
    } catch (error) {
      console.error('Error buscando empleados:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      searchEmployees(employeeSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [employeeSearchTerm]);

  // Función para limpiar la selección
  const clearSelection = () => {
    onEmployeeSelected('');
    setEmployeeSearchTerm('');
  };

  const getRoleLabel = () => {
    if (roles.includes('employee')) {
      return 'Seleccionar Empleado *';
    }
    if (roles.includes('supervisor')) {
      return 'Seleccionar Supervisor *';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1">
        {getRoleLabel()}
      </label>
      <Combobox 
        value={selectedEmployee}
        onChange={onEmployeeSelected}
      >
        <div className="relative">
          <div className="relative">
            <Combobox.Input
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground"
              placeholder="Buscar por nombre, DNI o email..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              displayValue={(employeeId) => {
                const employee = filteredEmployees.find(e => e.id === employeeId);
                return employee 
                  ? `${employee.first_name} ${employee.last_name} ${employee.dni ? `(${employee.dni})` : ''}`
                  : '';
              }}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              {selectedEmployee ? (
                <FiX 
                  className="h-5 w-5 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                />
              ) : (
                <FiChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </Combobox.Button>
          </div>
          
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {isSearching ? (
              <div className="px-4 py-2 text-sm text-foreground">
                Buscando empleados...
              </div>
            ) : filteredEmployees.length === 0 && employeeSearchTerm !== '' ? (
              <div className="px-4 py-2 text-sm text-foreground">
                No se encontraron empleados
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <Combobox.Option
                  key={employee.id}
                  value={employee.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-primary text-white' : 'text-foreground'
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                        {employee.first_name} {employee.last_name}
                        {employee.dni && ` (DNI: ${employee.dni})`}
                        {employee.email && ` - ${employee.email}`}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? 'text-white' : 'text-primary'
                          }`}
                        >
                          <FiCheck className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};

export default EmployeeSelector;