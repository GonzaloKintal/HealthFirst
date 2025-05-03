
import { useState } from 'react';
import { 
  FiCpu, FiUpload, FiSettings, FiPlay, FiBarChart2, 
  FiFile, FiTrash2, FiInfo, FiDownload 
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const MachineLearningPage = ({ activeTab }) => {
  const { user } = useAuth();
  const [dataset, setDataset] = useState(null);
  const [fileName, setFileName] = useState('');
  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [tabIndex, setTabIndex] = useState(activeTab || 0);

  // Simular carga de dataset
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      
      // Simular lectura del archivo
      setTimeout(() => {
        setDataset({
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified).toLocaleDateString(),
          rows: Math.floor(Math.random() * 1000) + 500,
          columns: Math.floor(Math.random() * 10) + 5
        });
        
        // Simular datos de preview
        const mockPreview = [];
        for (let i = 0; i < 5; i++) {
          const row = {};
          for (let j = 0; j < 5; j++) {
            row[`Feature_${j}`] = (Math.random() * 100).toFixed(2);
          }
          row['Target'] = Math.floor(Math.random() * 2);
          mockPreview.push(row);
        }
        setPreviewData(mockPreview);
      }, 1000);
    }
  };

  // Simular entrenamiento del modelo
  const trainModel = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          const accuracy = (Math.random() * 20 + 80).toFixed(2);
          setModelAccuracy(accuracy);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  // Resetear todo
  const resetAll = () => {
    setDataset(null);
    setFileName('');
    setModelAccuracy(null);
    setPreviewData([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiCpu className="mr-2" />
          Machine Learning
        </h1>
        <div className="flex space-x-3">
          <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition duration-200">
            <FiUpload className="mr-2" />
            Cargar Datos
            <input 
              type="file" 
              className="hidden" 
              accept=".csv,.xlsx,.json"
              onChange={handleFileUpload}
            />
          </label>
          <button 
            onClick={trainModel}
            disabled={!dataset || isTraining}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm font-medium text-white cursor-pointer transition duration-200 ${
              !dataset || isTraining 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FiPlay className="mr-2" />
            {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
          </button>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-700">
            <strong>Nota:</strong> Como administrador, puedes configurar los parámetros avanzados 
            de los modelos de machine learning y acceder a todos los datos de entrenamiento.
          </p>
        </div>
      )}

      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)} className="mt-6">
        <TabList>
          <Tab>Dataset</Tab>
          <Tab>Modelo</Tab>
        </TabList>

        <TabPanel>
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            {!dataset ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FiFile className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No hay dataset cargado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sube un archivo CSV, Excel o JSON para comenzar
                </p>
                <label className="mt-5 inline-flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm font-medium text-white hover:bg-blue-700 cursor-pointer transition duration-200">
                  <FiUpload className="mr-2" />
                  Seleccionar archivo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-medium">{dataset.name}</h2>
                    <p className="text-sm text-gray-500">
                      {dataset.rows} filas × {dataset.columns} columnas | Última modificación: {dataset.lastModified}
                    </p>
                  </div>
                  <button 
                    onClick={resetAll}
                    className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="mr-1" /> Eliminar
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Vista previa</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {previewData.length > 0 && Object.keys(previewData[0]).map((key, idx) => (
                              <th 
                                key={idx}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {Object.values(row).map((value, colIdx) => (
                                <td 
                                  key={colIdx}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition duration-200">
                    <FiDownload className="mr-2" />
                    Exportar Dataset
                  </button>
                  <label className="flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm font-medium text-white hover:bg-blue-700 cursor-pointer transition duration-200">
                    <FiUpload className="mr-2" />
                    Reemplazar
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv,.xlsx,.json"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel>
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-6">Modelo de Regresión Logística</h2>
            
            {isTraining && (
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progreso del entrenamiento</span>
                  <span className="text-sm font-medium">{trainingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {modelAccuracy ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Modelo entrenado exitosamente
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          Precisión del modelo: <span className="font-bold">{modelAccuracy}%</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Métricas del Modelo</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Precisión (Accuracy)</span>
                        <span className="font-medium">{modelAccuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precisión (Precision)</span>
                        <span className="font-medium">{(modelAccuracy * 0.95).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sensibilidad (Recall)</span>
                        <span className="font-medium">{(modelAccuracy * 0.97).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F1-Score</span>
                        <span className="font-medium">{(modelAccuracy * 0.96).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Matriz de Confusión</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 font-medium">Predicho 0</div>
                      <div className="col-span-1 font-medium">Predicho 1</div>
                      
                      <div className="col-span-1 font-medium">Real 0</div>
                      <div className="p-2 bg-blue-50">{(modelAccuracy * 4.5).toFixed(0)}</div>
                      <div className="p-2 bg-red-50">{(100 - modelAccuracy).toFixed(0)}</div>
                      
                      <div className="col-span-1 font-medium">Real 1</div>
                      <div className="p-2 bg-red-50">{(100 - modelAccuracy).toFixed(0)}</div>
                      <div className="p-2 bg-blue-50">{(modelAccuracy * 4.5).toFixed(0)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm font-medium text-white hover:bg-blue-700 cursor-pointer transition duration-200">
                    <FiDownload className="mr-2" />
                    Exportar Modelo
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiBarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {dataset ? 'Modelo no entrenado' : 'Dataset no cargado'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {dataset 
                    ? 'Entrena el modelo con el dataset cargado para ver las métricas' 
                    : 'Carga un dataset primero para poder entrenar el modelo'}
                </p>
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default MachineLearningPage;