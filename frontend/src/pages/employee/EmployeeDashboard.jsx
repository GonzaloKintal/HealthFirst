
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { getUser } from '../../services/userService';
import GradientText from '../supervisor/GradientText';


const EmployeeDashboard = () => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await getUser(authUser.id);
        setUserData(userResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 border-4 border-primary rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full">
      <div className="p-4 sm:p-6 md:p-10 h-full bg-background rounded-xl shadow-md border border-border overflow-hidden flex flex-col items-center">
        {/* Encabezado con animación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-8 w-full flex flex-col items-center"
        >
          {/* Contenedor de imagen con efecto de luz */}
          <div className="relative">
            {/* Luz azul detrás de la persona */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="
                h-32 sm:h-40 md:h-48 lg:h-52 xl:h-56 
                w-32 sm:w-40 md:w-48 lg:w-52 xl:w-56
                rounded-full 
                bg-blue-500/40 dark:bg-blue-400/40
                blur-[40px] sm:blur-[50px]
                transform scale-110
                animate-pulse-slow
              "></div>
            </div>

            {/* Imagen animada de la persona */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              className="mb-6 sm:mb-8 flex justify-center relative z-10"
            >
              <div className="relative">
                <img
                  src="/person.png"
                  alt="Persona saludando"
                  className="h-44 sm:h-48 md:h-56 lg:h-64 xl:h-72 w-auto transition-all duration-300 hover:scale-105"
                />
              </div>
            </motion.div>
          </div>

          {/* Texto de bienvenida */}
          <div className="w-full max-w-4xl text-center">
            <GradientText
              colors={["#2563eb", "#60a5fa", "#e0f2fe", "#60a5fa", "#2563eb"]}
              animationSpeed={4}
              showBorder={false}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              <h1 className="font-mono font-bold">
                ¡Bienvenido/a a HealthFirst,<br className="sm:hidden" /> {userData?.first_name || 'Empleado'}!
              </h1>
            </GradientText>
          </div>
        </motion.div>

        {/* Espacio flexible para empujar el footer hacia abajo */}
        <div className="flex-grow"></div>

        {/* Footer con logo y texto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center justify-center w-full mt-4 sm:mt-8 pt-4 sm:pt-8"
        >
          {/* Línea divisoria con efecto de gradiente */}
          <div className="w-full relative h-1 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-30 dark:via-blue-400 animate-gradient-border"></div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <img
              src="/logo2.svg"
              alt="Logo ProHealth"
              className="h-14 w-auto"
            />
            <span className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
              Tu salud nos importa.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;