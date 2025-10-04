# SpaceApps 2025 - Datacenter Designer

Proyecto de diseño de centros de datos con un backend FastAPI y un frontend Next.js con visualización 3D.

## 📋 Descripción

Este proyecto consta de dos componentes principales:
- **Backend FastAPI**: API REST para la gestión de módulos, estilos y diseños de datacenters
- **Frontend Next.js**: Interfaz web con diseñador visual 3D y gestión de datacenters

## 🛠️ Requisitos Previos

Asegúrate de tener instalado:
- **Python 3.8+** (para el backend)
- **Node.js 18+** (para el frontend)
- **pnpm** (gestor de paquetes para Node.js)
- **MongoDB** (base de datos)

### Instalar pnpm (si no lo tienes)
```bash
npm install -g pnpm
```

## 🚀 Instalación y Configuración

### 1️⃣ Backend (FastAPI)

#### Navega al directorio del backend:
```cmd
cd backend\fastapi-backend
```

#### Crea un entorno virtual (recomendado):
```cmd
python -m venv venv
venv\Scripts\activate
```

#### Instala las dependencias:
```cmd
pip install -r requirements.txt
```

#### Configura las variables de entorno:
Crea un archivo `.env` en `backend/fastapi-backend/` con la siguiente configuración:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=datacenter_db
```

#### Inicia el servidor:
```cmd
uvicorn app.main:app --reload
```

El backend estará disponible en: **http://localhost:8000**
- Documentación interactiva (Swagger): **http://localhost:8000/docs**
- Documentación alternativa (ReDoc): **http://localhost:8000/redoc**

---

### 2️⃣ Frontend (Next.js)

#### Navega al directorio del frontend:
```cmd
cd datacenter-designer
```

#### Instala las dependencias:
```cmd
pnpm install
```

#### Configura las variables de entorno (opcional):
Crea un archivo `.env.local` en `datacenter-designer/` si necesitas configurar variables personalizadas:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Inicia el servidor de desarrollo:
```cmd
pnpm dev
```

El frontend estará disponible en: **http://localhost:3000**

---

## 📦 Estructura del Proyecto

```
spaceapps2025/
├── backend/
│   └── fastapi-backend/          # API REST con FastAPI
│       ├── app/
│       │   ├── main.py           # Punto de entrada de la aplicación
│       │   ├── routers/          # Endpoints de la API
│       │   ├── services/         # Lógica de negocio
│       │   ├── models/           # Modelos de datos
│       │   └── repositories/     # Acceso a datos
│       ├── DB/                   # Scripts y esquemas de base de datos
│       ├── tests/                # Pruebas unitarias
│       └── requirements.txt      # Dependencias de Python
│
└── datacenter-designer/          # Aplicación Next.js
    ├── app/                      # Páginas y rutas de Next.js
    │   ├── api/                  # API routes
    │   ├── datacenter/           # Vistas de datacenter
    │   └── designer/             # Editor de diseño
    ├── components/               # Componentes React
    │   ├── ui/                   # Componentes de UI (shadcn/ui)
    │   └── datacenter-designer.tsx
    ├── public/                   # Archivos estáticos
    │   ├── data/                 # Datos JSON
    │   └── models/               # Modelos 3D (.obj)
    └── package.json              # Dependencias de Node.js
```

---

## 🎯 Funcionalidades Principales

### Backend (API)
- ✅ Gestión de módulos de datacenter
- ✅ Estilos y diseños personalizados
- ✅ CRUD de datacenters
- ✅ Sistema de posicionamiento de módulos
- ✅ Integración con MongoDB

### Frontend
- ✅ Diseñador visual 3D con Three.js
- ✅ Biblioteca de módulos arrastrables
- ✅ Gestión de estilos de datacenter
- ✅ Interfaz moderna con shadcn/ui
- ✅ Visualización de modelos 3D

---

## 🧪 Ejecutar Tests

### Backend:
```cmd
cd backend\fastapi-backend
pytest
```

### Frontend:
```cmd
cd datacenter-designer
pnpm test
```

---

## 📝 Scripts Disponibles

### Backend
```cmd
# Iniciar servidor de desarrollo
uvicorn app.main:app --reload

# Iniciar servidor de producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```cmd
# Desarrollo
pnpm dev

# Construcción para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linter
pnpm lint
```

---

## 🔧 Solución de Problemas

### El backend no se conecta a MongoDB
- Verifica que MongoDB esté corriendo: `mongod`
- Comprueba la URL en el archivo `.env`
- Asegúrate de que el puerto 27017 esté disponible

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa la configuración CORS en `app/main.py`
- Comprueba que `NEXT_PUBLIC_API_URL` esté configurado correctamente

### Error al instalar dependencias de pnpm
- Elimina `node_modules` y `pnpm-lock.yaml`
- Ejecuta `pnpm install` nuevamente

---

## 🤝 Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto fue creado para el SpaceApps Challenge 2025.

---

## 📧 Contacto

Para más información sobre el proyecto, contacta al equipo de desarrollo.

---

## 🌟 Notas Adicionales

- El proyecto utiliza **shadcn/ui** para los componentes de interfaz
- Los modelos 3D están en formato `.obj` en `public/models/`
- La visualización 3D usa **React Three Fiber** y **drei**
- El backend soporta **CORS** para el desarrollo local
