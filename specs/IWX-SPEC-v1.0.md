# IWX – Index Wire eXchange Protocol
## Especificación v1.0

### 1. Objetivo

IWX es un protocolo de transporte compacto basado en esquemas. En lugar de enviar objetos con nombres de
campos (como JSON tradicional), IWX envía los valores en un array ordenado y usa un identificador de
esquema (`schema_id`) para reconstruir la estructura.

IWX no reemplaza a HTTP ni a TLS; se implementa como un *wire format* que viaja sobre ellos.

### 2. Terminología

- **Payload IWX**: cuerpo del mensaje que sigue la estructura definida por esta especificación.
- **Esquema IWX**: documento JSON que define los campos, posiciones y tipos de un modelo.
- **schema_id**: identificador numérico entero del esquema.
- **Backend fields**: nombres internos usados del lado servidor.
- **Frontend fields**: nombres o alias usados en el cliente.
- **Perfil JSON**: representación de IWX usando JSON como contenedor.
- **Perfil BIN**: representación binaria compacta de IWX.

### 3. Estructura básica del payload (perfil JSON)

Un payload IWX-JSON mínimo tiene la siguiente forma:

```json
{
  "_s": 1,
  "_v": ["t-001", "2025-01-01", 199.9]
}
```

Campos:

- `_s` (**schema_id**): número entero que identifica el esquema.
- `_v`: array de valores ordenados por posición (`pos`) en el esquema.

#### Reglas

1. `_s` es obligatorio.
2. `_v` es obligatorio.
3. `_v` debe ser un array JSON.
4. Los valores se interpretan según la definición de `fields[pos]` en el esquema.

### 4. Tipos soportados

Los campos pueden tener los siguientes tipos lógicos:

- `string`
- `number` (incluye enteros y decimales)
- `boolean`
- `date` (texto con formato ISO 8601, p.ej. `2025-01-01` o `2025-01-01T12:34:56Z`)
- `null`

Los tipos se aplican en el backend al reconstruir el objeto de dominio.

### 5. Esquemas

Los esquemas IWX se definen en JSON. Ver `specs/SCHEMA-SPEC.md` para la definición formal.

Ejemplo abreviado:

```json
{
  "name": "Sale",
  "schema_id": 1,
  "version": 1,
  "fields": [
    {
      "pos": 0,
      "backend": "tenant_id",
      "frontend": "tenant",
      "type": "string",
      "required": true
    },
    {
      "pos": 1,
      "backend": "date",
      "frontend": "sale_date",
      "type": "date",
      "required": true
    },
    {
      "pos": 2,
      "backend": "total",
      "frontend": "amount",
      "type": "number",
      "required": true
    }
  ]
}
```

### 6. Validación

Cuando el backend recibe un payload IWX-JSON:

1. Valida que `_s` exista y sea numérico.
2. Busca el esquema asociado a `_s` en el *schema registry* local.
3. Valida que `_v` sea un array.
4. Para cada campo definido en el esquema:
   - Obtiene el valor en `values[field.pos]` (o `null` si falta).
   - Aplica validaciones:
     - Si `required` es `true` y el valor es `null` o no existe → error.
     - Si el tipo no coincide → error.
5. Reconstruye un objeto interno con las keys `backend`.

### 7. Manejo de errores

Los errores se devuelven en JSON normal (no en IWX), por ejemplo:

```json
{
  "error": {
    "code": "IWX_INVALID_PAYLOAD",
    "message": "Missing required field at position 1 (date)",
    "schema_id": 1
  }
}
```

Se recomienda usar códigos de error con prefijo `IWX_`.

### 8. Versionado

- `schema_id` representa una versión lógica del esquema.
- Cambios incompatibles (por ejemplo, quitar un campo requerido) deben producir un nuevo `schema_id`.
- La API HTTP puede mantener su versión (`/api/v1/...`) independientemente del `schema_id`.

### 9. Seguridad

- IWX puede usarse sobre HTTP/TLS como cualquier JSON.
- Para añadir confidencialidad adicional, se define el perfil **IWX-Secure** (ver `IWX-SECURE-v1.0.md`).
- El perfil seguro cifra el contenido lógico de `_v` sin afectar a `_s`.

### 10. Interoperabilidad

- IWX-JSON es legible y fácil de depurar.
- IWX-BIN ofrece más compactación para canales internos o de alto rendimiento.
- Ambos comparten la misma semántica de esquema y `schema_id`.

