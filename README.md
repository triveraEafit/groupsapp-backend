# GroupsApp

Aplicacion de mensajeria con:
- registro y login
- grupos
- chat grupal en tiempo real
- mensajes directos 1 a 1
- historial de mensajes
- read receipts en mensajes directos
- carga y descarga de archivos en mensajes directos
- estado online/offline basado en conexiones WebSocket activas

Stack actual:
- Backend: FastAPI + SQLAlchemy + PostgreSQL + WebSocket
- Frontend: React + Vite + Tailwind

## Requisitos

- Python 3.13
- Node 24
- npm 11
- PostgreSQL local o remoto

Versiones probadas en desarrollo:
- Python `3.13.9`
- Node `v24.13.1`
- npm `11.10.0`

## Estructura

- `app/`: backend FastAPI
- `frontend/`: frontend React
- `uploads/`: archivos cargados en mensajes directos
- `requirements.txt`: dependencias de Python

## Dependencias

Backend:

```bash
cd groupsapp-backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Frontend:

```bash
cd groupsapp-backend/frontend
npm ci
```

## Configuracion de base de datos

La conexion a PostgreSQL esta definida actualmente en `app/database.py`:

```python
DATABASE_URL = "postgresql://postgres:password@localhost:5432/groupsapp"
```

Debes tener una base `groupsapp` disponible con esas credenciales, o ajustar ese archivo a tu entorno.

Ejemplo minimo en PostgreSQL:

```sql
CREATE DATABASE groupsapp;
```

Nota:
- las tablas se crean al iniciar el backend
- si vienes de otra rama con un esquema distinto, lo recomendable es recrear la base antes de probar

## Como correr el proyecto

### 1. Backend

```bash
cd groupsapp-backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

Disponible en:
- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

### 2. Frontend

```bash
cd groupsapp-backend/frontend
npm run dev
```

Disponible en:
- App: `http://127.0.0.1:5173`

El frontend usa proxy de Vite para redirigir `/api` a `http://127.0.0.1:8000`, incluyendo WebSocket.

## Como usar la aplicacion

### Registro

Para crear una cuenta:
- ingresa `username`
- ingresa `email`
- ingresa una `password` de minimo 6 caracteres
- confirma la misma password

La UI valida:
- password minima de 6 caracteres
- confirmacion igual a la password

### Login

Inicia sesion con:
- `username`
- `password`

### Grupos

Puedes:
- crear un grupo con nombre y descripcion
- unirte a un grupo existente con el ID del grupo
- ver tus grupos cargados desde `GET /groups/my-groups`
- abrir el chat del grupo y enviar mensajes en tiempo real

### Mensajes directos

Puedes:
- abrir un chat directo usando el `username` del otro usuario
- ver historial completo
- marcar mensajes como leidos
- ver conteo de mensajes directos no leidos

### Archivos

Actualmente los archivos funcionan en mensajes directos:
- selecciona un archivo con el boton `Attach`
- el frontend lo envia al endpoint `POST /groups/dm/upload/{username}`
- el backend guarda el archivo en `uploads/`
- el mensaje queda asociado al archivo en la BD
- el receptor puede descargarlo desde el chat

### Online / Offline

El backend mantiene una lista de usuarios online a partir de conexiones WebSocket activas.

Se exponen endpoints para consultar presencia:
- `GET /groups/online-users`
- `GET /groups/user/{user_id}/online`
- `GET /groups/user/by-username/{username}/online`

## Flujo recomendado de prueba

1. Levanta backend y frontend.
2. Registra dos usuarios.
3. Haz login con el primer usuario.
4. Crea un grupo.
5. Abre otra sesion con el segundo usuario.
6. Unete al grupo usando el ID.
7. Prueba chat grupal en dos ventanas o una normal y otra en incognito.
8. Prueba mensajes directos usando el username del otro usuario.
9. Prueba enviar un archivo en un mensaje directo.
10. Descarga el archivo desde el chat receptor.

## Endpoints principales

Auth:
- `POST /users/register`
- `POST /users/login`

Grupos:
- `POST /groups/`
- `POST /groups/{group_id}/join`
- `GET /groups/my-groups`
- `GET /groups/{group_id}/messages`
- `WS /groups/ws/{group_id}?token=JWT`

Mensajes directos:
- `GET /groups/dm/history/{username}`
- `GET /groups/dm/unread`
- `POST /groups/dm/mark-read/{username}`
- `POST /groups/dm/upload/{username}`
- `GET /groups/dm/download/{message_id}?token=JWT`
- `WS /groups/dm/ws/{username}?token=JWT`

## Comandos utiles

Build del frontend:

```bash
cd groupsapp-backend/frontend
npm run build
```

Estado del repo:

```bash
git status
```

Actualizar una rama remota:

```bash
git pull origin <branch>
```

## Limitaciones actuales

- `POST /users/login` todavia no valida realmente la password contra el hash almacenado; antes de un despliegue productivo eso debe corregirse.
- `DATABASE_URL` y `SECRET_KEY` siguen definidos en el codigo y deben moverse a variables de entorno para AWS.
- La presencia online depende de conexiones WebSocket activas; no reemplaza un sistema de presencia persistente.
- Los archivos cargados se guardan localmente en `uploads/`; para AWS conviene mover eso a un storage externo.

## Despliegue

Para desplegar esta aplicacion en AWS, lo minimo recomendado es:

1. mover credenciales y secretos a variables de entorno
2. usar una base PostgreSQL administrada
3. configurar almacenamiento persistente para archivos
4. asegurar soporte de WebSocket en el balanceador o proxy
5. corregir la validacion real de password en login
