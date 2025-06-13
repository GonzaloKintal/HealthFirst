import { useEffect, useState } from 'react';
import { FiBook, FiFileText, FiSend } from 'react-icons/fi';
import RequestLicense from './sections/RequestLicense';
import LicenseTypes from './sections/LicenseTypes';
import SectionBase from './sections/SectionBase';
import React from 'react';

const GuidePage = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isChangingSection, setIsChangingSection] = useState(false);
  
  const guideSections = [
    {
      id: 'solicitar-licencia',
      title: 'Cómo solicitar licencia',
      icon: <FiSend className="mr-2 text-foreground" />,
      component: <RequestLicense />,
    },
    {
      id: 'tipos-licencia',
      title: 'Tipos de licencia disponibles',
      icon: <FiFileText className="mr-2 text-foreground" />,
      component: <LicenseTypes />,
    },
  ];

  useEffect(() => {
    if (isChangingSection) {
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        setIsChangingSection(false);
      };

      window.scrollTo(0, 0);
      const timer = setTimeout(scrollToTop, 50);
      return () => clearTimeout(timer);
    }
  }, [activeSection, isChangingSection]);

  const scrollToSection = (index) => {
    if (index !== activeSection) {
      setIsChangingSection(true);
      setActiveSection(index);
    }
  };

  return (
    <div className="p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
          <FiBook className="mr-2" />
          Guía del Sistema
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Índice lateral */}
        <div className="flex-shrink-0">
          <div className="lg:sticky lg:top-6">
            <div className="bg-card p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Índice</h2>
              <nav className="space-y-2">
                {guideSections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(index)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeSection === index
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-foreground'
                    }`}
                  >
                    <div className="flex items-center">
                      {React.cloneElement(section.icon, {
                        className: `mr-2 ${activeSection === index ? 'text-white' : 'text-foreground'}`
                      })}
                      {section.title}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="bg-card p-6 rounded-lg shadow">
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Bienvenido a la guía del sistema</h2>
            </div>

            <div className="flex items-center mb-4">
              {guideSections[activeSection].icon}
              <h3 className="text-lg font-medium text-foreground">
                {guideSections[activeSection].title}
              </h3>
            </div>
            
            {guideSections[activeSection].component}

            <div className="mt-8 p-4 bg-special-light dark:bg-special-dark border-l-4 border-primary-border rounded">
              <p className="text-primary-text">
                ¿No encuentras lo que buscas? Contacta al{' '}
                <strong className="text-primary-text">equipo de soporte</strong> para más ayuda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;