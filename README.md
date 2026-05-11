# Proyecta

Aplicación de gestión de proyectos estilo Kanban construida con Django REST Framework y React. Permite organizar el trabajo en workspaces, tableros y tareas con drag & drop en tiempo real.

---

## Funcionalidades

- **Autenticación completa** — registro, login y refresh automático de tokens JWT
- **Workspaces** — espacios de trabajo con sistema de invitaciones y roles (owner / member)
- **Tableros Kanban** — múltiples tableros por workspace con columnas personalizadas
- **Drag & drop** — mover tareas entre columnas con actualización optimista
- **Tareas** — título, descripción, prioridad (alta / media / baja), fecha límite y asignados
- **Perfiles de usuario** — foto de perfil, biografía y edición inline
- **Invitaciones** — invitá miembros a un workspace por email

---

## Stack

### Backend
| Librería | Uso |
|---|---|
| Django 5 | Framework principal |
| Django REST Framework | API REST |
| djangorestframework-simplejwt | Autenticación JWT |
| django-cors-headers | Configuración de CORS |
| django-filter | Filtros en la API |
| psycopg2-binary | Conector PostgreSQL |
| Pillow | Procesamiento de imágenes |
| python-decouple | Variables de entorno |

### Frontend
| Librería | Uso |
|---|---|
| React 18 + Vite | Framework y bundler |
| React Router v6 | Enrutamiento |
| Zustand | Estado global |
| Axios | Cliente HTTP |
| @hello-pangea/dnd | Drag & drop |
| @tanstack/react-query | Caché de datos (opcional) |

---

## Requisitos previos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

---

## Levantar el proyecto en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/proyecta.git
cd proyecta
```

### 2. Configurar el backend

```bash
cd backend

# Crear y activar el entorno virtual
python -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

Crear el archivo `.env` dentro de `backend/`:

```env
DB_NAME=proyecta_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=tu_secret_key_aqui
DEBUG=True
```

Crear la base de datos en PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE proyecta_db;
\q
```

Aplicar migraciones y levantar el servidor:

```bash
python manage.py migrate
python manage.py createsuperuser   # opcional
python manage.py runserver
```

El backend queda disponible en `http://127.0.0.1:8000`

---

### 3. Configurar el frontend

```bash
cd ../frontend

# Instalar dependencias
npm install
```

Crear el archivo `.env` dentro de `frontend/`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

El frontend queda disponible en `http://localhost:5173`

---

## Estructura del proyecto

```
proyecta/
├── backend/
│   ├── venv/
│   ├── config/          # Settings, URLs, WSGI
│   ├── apps/
│   │   ├── users/       # Auth, perfiles
│   │   ├── workspaces/  # Workspaces, membresías, invitaciones
│   │   └── boards/      # Tableros, columnas, tareas
│   ├── media/           # Imágenes subidas
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── api/         # Funciones de fetch (axios)
        ├── components/  # Componentes reutilizables
        ├── pages/       # Vistas por ruta
        └── store/       # Estado global (Zustand)
```

---

## Endpoints principales

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/token/refresh/
GET    /api/auth/me/
GET    /api/auth/profile/:username/

GET    /api/workspaces/workspaces/
POST   /api/workspaces/workspaces/
POST   /api/workspaces/workspaces/:id/invite/
GET    /api/workspaces/user-invitations/

GET    /api/boards/
POST   /api/boards/
GET    /api/columns/
POST   /api/columns/
GET    /api/tasks/
POST   /api/tasks/
PATCH  /api/tasks/:id/move/
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_NAME` | Nombre de la base de datos | `proyecta_db` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `mi_password` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `SECRET_KEY` | Clave secreta de Django | `django-insecure-...` |
| `DEBUG` | Modo debug | `True` |
| `VITE_API_URL` | URL base del backend | `http://127.0.0.1:8000/api` |
