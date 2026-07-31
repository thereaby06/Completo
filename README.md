# Sistema de Gestión de Taller

Proyecto reiniciado desde cero con una arquitectura limpia.

## Estructura
- `/backend`: API construida con Node.js, Express y Prisma.
- `/frontend`: Aplicación SPA construida con React, Vite y Tailwind CSS.

## Desarrollo local
1. Instalar dependencias:
   - `npm install`
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Variables de entorno:
   - Backend: copiar `backend/.env.example` a `backend/.env`
   - Frontend: copiar `frontend/.env.example` a `frontend/.env`
3. Levantar en modo desarrollo desde la raíz:
   - `npm run dev`
4. Calidad:
   - `npm run lint`
   - `npm run format` / `npm run format:check`

## Despliegue en Render

Este proyecto está configurado para desplegarse como un **Monorepo** en Render.com.

### 1. Preparar la Base de Datos
Para un entorno de producción real, se recomienda usar una base de datos administrada (como PostgreSQL en Supabase o Neon). 
1. Crea una instancia de base de datos.
2. Copia la URL de conexión (ConnectionString).
3. En Render, configura la variable de entorno `DATABASE_URL` con esa URL.

### 2. Pasos en Render
1. Conecta tu repositorio de GitHub.
2. Render detectará el archivo `render.yaml` automáticamente.
3. Se crearán dos servicios:
   - **workshop-backend**: El servidor de API.
   - **workshop-frontend**: El sitio estático de React.

### 3. Variables de Entorno Necesarias
**En el Backend:**
- `DATABASE_URL`: URL de tu base de datos.
- `FRONTEND_URL`: URL de tu sitio estático (ej. `https://completo.onrender.com`).
- `RESET_DB`: `true` si quieres forzar recreación del esquema en cada build (modo demo).
- `RUN_SEED`: `true` si quieres ejecutar `backend/prisma/seed.js` durante el build (modo demo).

**En el Frontend:**
- `VITE_API_URL`: URL de tu servicio de backend (ej. `https://workshop-backend.onrender.com`).


## Credenciales de prueba
- **Email**: admin@workshop.com
- **Contraseña**: admin123
