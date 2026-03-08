# API de Envío y Descarga de Archivos

## ✅ Implementación Completada

### Endpoints Disponibles

#### 1. **Subir archivo** (POST)
```
POST /api/groups/dm/upload/{username}
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  file: [archivo]
```

**Ejemplo con JavaScript:**
```javascript
async function uploadFile(username, file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/groups/dm/upload/${username}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
}
```

**Respuesta:**
```json
{
  "message": "Archivo subido correctamente",
  "file_id": 123,
  "file_name": "documento.pdf",
  "file_size": 23700
}
```

#### 2. **Descargar archivo** (GET)
```
GET /api/groups/dm/download/{message_id}
Authorization: Bearer {token}
```

**Ejemplo con JavaScript:**
```javascript
async function downloadFile(messageId, token) {
  const response = await fetch(`/api/groups/dm/download/${messageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'archivo'; // O usar el nombre del archivo del response header
  a.click();
}
```

#### 3. **Historial con archivos** (GET)
```
GET /api/groups/dm/history/{username}
```

**Respuesta incluye información de archivos:**
```json
[
  {
    "id": 123,
    "content": "📎 File attachment: documento.pdf",
    "sender_id": 1,
    "receiver_id": 2,
    "created_at": "2026-03-08T12:53:02",
    "is_read": true,
    "file_name": "documento.pdf",
    "file_path": "abc123.pdf",
    "file_size": 23700,
    "file_type": "application/pdf"
  }
]
```

### Cambios en la Base de Datos

Se agregaron las siguientes columnas a `direct_messages`:
- `file_name` (VARCHAR) - Nombre original del archivo
- `file_path` (VARCHAR) - Nombre único en el servidor
- `file_size` (INTEGER) - Tamaño en bytes
- `file_type` (VARCHAR) - MIME type

### Archivos Soportados

Cualquier tipo de archivo puede ser enviado. Los archivos se guardan en la carpeta `uploads/` con nombres únicos generados con UUID.

### Seguridad

- Solo el emisor y receptor pueden descargar el archivo
- Se requiere autenticación (JWT token)
- Los archivos se verifican antes de ser descargados
