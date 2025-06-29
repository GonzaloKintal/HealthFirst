# HealthFirst 🩺

## Descripción General 📋

HealthFirst es un sistema de gestión de licencias diseñado para optimizar el proceso de solicitud, aprobación y seguimiento de licencias laborales, integrando funcionalidades avanzadas basadas en machine learning. Este sistema permite a los empleados gestionar solicitudes digitales, a los supervisores aprobar o rechazar solicitudes, y al área de Recursos Humanos (RRHH) realizar un seguimiento eficiente. Además, incorpora análisis de anomalías en solicitudes y aprobaciones, detección de riesgos de salud laboral, y validación automática de certificados médicos, garantizando un enfoque moderno y eficiente para la gestión de salud y bienestar ocupacional. 🌟

## Equipo de Desarrollo 👥
- **Product Owner (docente)**: Leandro Dikenstein Hidalgo
- **Scrum Master**: Franco Mendoza 🧑‍💼
- **Líder Técnico**: Gonzalo Kintal 💻
- **Desarrolladores backend**: Fabián Hunt, Sergio Irala ⚙️
- **Desarrolladores frontend**: Gonzalo Kintal 🎨
- **Data Scientists**: Natalia Gutierrez, Celina Fuentes 📊
- **QA/Testing**: Juan Saltiva, Franco Mendoza, Natalia Gutierrez 🧪

## Tecnologías Utilizadas 🛠️

HealthFirst utiliza un stack tecnológico moderno y escalable para garantizar un desarrollo ágil, mantenible y de alta calidad:

- **Control de Versiones**: Git 📜
- **Frontend**: React, Tailwind CSS (interfaz ágil y responsive) 🖼️
- **Backend**: Django (Python) para la lógica de negocio y APIs 🛠️
- **Base de Datos**: PostgreSQL (robusta y eficiente) 🗄️
- **Pruebas Automatizadas**:
  - Backend: UnitTest 🧪
  - Frontend: Playwright 🎭
- **Pruebas de APIs**: Postman 📡
- **Integración de Analíticas**: Metabase 📈
- **Machine Learning**: Scikit-learn. Modelos para detección de anomalías, análisis de riesgos de salud y análisis inteligente de certificados 🤖

## Funcionalidades ✨

### Gestión de Usuarios 👤

- Registro de nuevos usuarios por parte del administrador. ➕
- Baja de usuarios por parte del administrador. ➖
- Acceso seguro para usuarios registrados. 🔒
- Notificaciones automáticas a empleados en eventos clave. 📩

### Gestión de Licencias 📅

- Solicitud de licencias por parte de los usuarios. 📝
- Carga de certificados médicos. 📄
- Evaluación de solicitudes (aprobar/rechazar) por supervisores. ✅❌
- Visualización del estado de las solicitudes por los usuarios. 👀
- Registro y actualización automática de estados de licencias. 🔄
- Determinación automática de la necesidad de justificación. 🕵️‍♂️
- Identificación de solicitudes injustificadas. 🚩
- Sugerencias automáticas al completar solicitudes. 💡
- Detección de anomalías en solicitudes de empleados. ⚠️
- Expiración automática de licencias. ⏳

### Validación y Control 🔍

- Validación de coherencia entre certificados y solicitudes. ✔️
- Generación de certificados médicos con códigos únicos para prevenir duplicados y fraudes. 🛡️
- Detección de anomalías en aprobaciones/rechazos de supervisores. 🚨
- Detección de anomalías en solicitudes de empleados. 🚨
- Módulo de mensajería para notificaciones. 💬
- Tarea automatizada para retroalimentación de modelos de machine learning. 🔄

### Interfaz y Roles 🖥️

- Vistas personalizadas para RRHH, supervisores, empleados y analistas de datos. 👩‍💼👨‍💻
- Gráficos de métricas clave con filtros. 📊
- Interfaz intuitiva para gestión de licencias. 🖱️
- Registro de nuevos departamentos por el administrador. 🏢
- Gráficos interactivos de anomalías para administradores y analistas. 📉
- Gráficos interactivos de riesgos de salud. ⚕️
- Formato estándar de certificados médicos para empleados. 📜
- Bot de Telegram para interacción con usuarios. 🤖

### Reportes y Consultas 📑

- Historial detallado de licencias. 📚
- Consultas personalizadas para seguimiento de licencias. 🔎

### Requerimientos No Funcionales ⚙️

- Validación de certificados de hasta 10MB (.pdf o imagen). 📂
- Compatibilidad total con dispositivos móviles. 📱
- Integración con Metabase para analíticas. 📊
- Modo oscuro opcional en la interfaz web. 🌙

## Alcance del Proyecto 🎯

El proyecto HealthFirst tiene como objetivo desarrollar un **Módulo de Salud y Bienestar Ocupacional** que digitalice y optimice la gestión de licencias laborales. Las principales características incluyen:

- Solicitud digital de licencias con justificaciones. 📝
- Aprobación/rechazo de solicitudes por supervisores. ✅❌
- Carga y validación automática de certificados médicos. 📄
- Predicción de requerimientos documentales mediante machine learning. 🤖
- Seguimiento de estados de solicitudes (Pendiente, Falta documento, Completa). 📊
- Interfaz adaptada según el rol del usuario (empleado, supervisor, RRHH, analista). 👥
- Reportes y analíticas básicas para métricas relevantes. 📈
- Detección de anomalías en solicitudes y aprobaciones mediante machine learning. 🚨
- Predicción de riesgos de salud laboral. ⚕️

## Instalación y Configuración 🛠️

1. **Clonar el Repositorio**:

   ```bash
   git clone <URL-del-repositorio>
   cd HealthFirst
   ```

2. **Configurar el Frontend**:

   ```bash
   cd frontend
   npm install
   ```

3. **Configurar el Backend**:

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Configurar la Base de Datos**:

   - Asegúrate de tener PostgreSQL instalado y configurado. 🗄️
   - Actualiza las credenciales de la base de datos en el archivo de configuración de Django (`settings.py`).

## Ejecución 🚀

1. **Ejecutar el Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

2. **Ejecutar el Backend**:

   ```bash
   cd backend
   python manage.py runserver
   ```

3. **Acceder a la Aplicación**:

   - El frontend estará disponible en `http://localhost:5173` (o el puerto configurado por Vite). 🌐
   - El backend estará disponible en `http://localhost:8000`. 🌐

## Video | Demo completa 🎥
[Ver demo](https://youtu.be/FeHlJV5aQow)
