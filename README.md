# GroupsApp

Integracion del backend `login` con el frontend de chat en la rama `frontend-on-login`.

Stack actual:
- Backend: FastAPI + SQLAlchemy + PostgreSQL + WebSocket
- Frontend: React + Vite + Tailwind

## Requisitos

- Python `3.13.9` probado localmente
- Node `v24.13.1` y npm `11.10.0` probados localmente
- PostgreSQL corriendo en local

## Backend

### 1. Crear entorno virtual e instalar dependencias

```bash
cd groupsapp-backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Configurar base de datos

El backend actual no toma la URL de la BD desde `.env`.
La conexion esta hardcodeada en `app/database.py`:

```python
DATABASE_URL = "postgresql://postgres:password@localhost:5432/groupsapp"
```

Debes tener una base de datos local con esas credenciales, o editar ese archivo para usar las tuyas.

Ejemplo para crear la base en PostgreSQL:

```sql
CREATE DATABASE groupsapp;
```

Si vienes de otra rama y tu esquema local esta viejo, lo correcto es recrear la BD antes de probar esta rama.

### 3. Levantar backend

```bash
cd groupsapp-backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

Backend disponible en:
- API root: `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/docs`

## Frontend

### 1. Instalar dependencias

```bash
cd groupsapp-backend/frontend
npm ci
```

### 2. Levantar frontend

```bash
cd groupsapp-backend/frontend
npm run dev
```

Frontend disponible en:
- `http://127.0.0.1:5173`

La configuracion de Vite ya proxya `/api` hacia `http://127.0.0.1:8000`, incluyendo WebSocket.

## Flujo de prueba recomendado

1. Levanta backend y frontend.
2. Registra dos usuarios.
3. Haz login con un usuario y crea un grupo.
4. Desde el segundo usuario, entra al grupo por ID.
5. Abre dos pestañas separadas o una ventana normal y otra en incognito.
6. Prueba mensajes de grupo.
7. Prueba mensaje directo usando el `username` del otro usuario.

Nota: el frontend usa `sessionStorage`, no `localStorage`, para que cada pestaña pueda mantener una sesion distinta.

## Comandos utiles

### Build del frontend

```bash
cd groupsapp-backend/frontend
npm run build
```

### Estado del repo

```bash
git status
```

## Limitaciones conocidas

- El backend actual no valida la contrasena en `POST /users/login`. Antes de desplegar, eso debe corregirse.
- La presencia `online/offline` que ves en el frontend hoy representa el estado del WebSocket del chat actual, no una presencia global compartida entre usuarios.
- El envio de archivos ya esta preparado en la UI, pero sigue pendiente el endpoint/backend real para subir, guardar y devolver metadata del archivo.
- La configuracion sensible sigue hardcodeada en backend (`DATABASE_URL`, `SECRET_KEY`). Para AWS hay que mover eso a variables de entorno.

## Despliegue futuro

Antes de AWS, faltan al menos estos ajustes:

1. Mover `DATABASE_URL` y `SECRET_KEY` a variables de entorno.
2. Corregir validacion real de password en login.
3. Implementar subida real de archivos.
4. Implementar presencia compartida real.
5. Usar PostgreSQL administrado y storage para archivos.
