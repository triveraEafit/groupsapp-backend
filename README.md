
# GroupsApp – Backend

Backend del proyecto académico **GroupsApp**, desarrollado para el curso *Tópicos de Telemática*.

API REST construida con FastAPI que permite registro, autenticación con JWT y gestión básica de grupos.

---

## 🧱 Stack tecnológico

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT (OAuth2 Password Flow)
- Uvicorn

---

## 🚀 Funcionalidades actuales

- Registro de usuarios
- Login con JWT
- Protección de rutas con Bearer Token
- Crear grupo
- Unirse a grupo

---

## 📌 Endpoints principales

- `POST /users/register`
- `POST /users/login`
- `POST /groups/`
- `POST /groups/{group_id}/join`

Documentación automática disponible en:

```

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

````

---

## ▶️ Cómo ejecutar el proyecto

### 1️⃣ Crear entorno virtual


python3 -m venv .venv
source .venv/bin/activate   # Mac/Linux


### 2️⃣ Instalar dependencias

pip install -r requirements.txt


### 3️⃣ Configurar variables de entorno

Crear un archivo `.env` basado en `.env.example` (si aplica).

### 4️⃣ Ejecutar servidor


python3 -m uvicorn app.main:app --reload


Servidor disponible en:

```
http://127.0.0.1:8000
```

---

## 🛣 Próximos pasos

* `GET /groups`
* `GET /groups/{id}`
* Sistema de mensajería
* Integración con WebSockets

---

Proyecto académico – 2026

