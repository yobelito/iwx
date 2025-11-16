# IWX-Secure – Perfil de Cifrado Interno
## Especificación v1.0

### 1. Objetivo

IWX-Secure define un perfil opcional de IWX en el que el contenido lógico de `_v` se cifra con una clave
simétrica de sesión. El objetivo es añadir una segunda capa de seguridad encima de TLS, de forma que:

- Si un atacante obtiene trazas de red históricas (incluso si TLS fuera comprometido a futuro),
  el contenido del payload siga cifrado.
- El backend pueda rotar o cambiar el mecanismo de cifrado sin cambiar la API HTTP.

### 2. Estructura del payload IWX-Secure (JSON)

```json
{
  "_s": 1,
  "_k": "iwx-ks-123",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext)"
}
```

Campos adicionales:

- `_k`: identificador de la clave simétrica de sesión.
- `_a`: nombre del algoritmo usado (por defecto, `"AES-256-GCM"`).
- `_iv`: vector de inicialización (IV) en Base64.
- `_v`: ciphertext (datos cifrados) en Base64.

El plaintext cifrado es típicamente el JSON de un array con los valores de `_v` del perfil normal:

```json
["t-001", "2025-01-01", 199.9]
```

### 3. Handshake de sesión

Se recomienda un endpoint dedicado para obtener la clave de sesión:

#### Request

```
POST /iwx/handshake
Authorization: Bearer <token>
Accept: application/json
```

#### Response

```json
{
  "iwx_mode": "secure",
  "key_id": "iwx-ks-123",
  "alg": "AES-256-GCM",
  "key": "BASE64(32_bytes_aleatorios)"
}
```

El servidor:

- Genera una clave de 256 bits.
- Genera un `key_id`.
- Almacena `key_id -> key` asociado a la sesión/usuario.

El cliente:

- Guarda `key_id` y `key` en memoria.
- Usa esos datos para cifrar los payloads IWX.

### 4. Proceso de cifrado (cliente)

1. Construir el array de valores IWX: `values = [...]`.
2. Serializar a JSON: `plaintext = JSON.stringify(values)`.
3. Convertir a bytes (UTF-8).
4. Generar un IV aleatorio (p.ej. 12 bytes).
5. Cifrar con AES-256-GCM usando `key` e `iv`.
6. Construir el payload:

```json
{
  "_s": <schema_id>,
  "_k": "<key_id>",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext)"
}
```

### 5. Proceso de descifrado (servidor)

1. Extraer `_s`, `_k`, `_a`, `_iv`, `_v`.
2. Buscar la clave simétrica: `key = lookup_key(key_id)`.
3. Decodificar `iv` y `ciphertext` desde Base64.
4. Descifrar con AES-256-GCM.
5. Parsear el plaintext como JSON → array de valores.
6. Aplicar el esquema como en IWX-JSON normal.

### 6. Headers recomendados

El cliente puede indicar el modo:

- `Content-Type: application/vnd.iwx+json`
- `X-IWX-Mode: secure`

El servidor puede rechazar payloads no seguros si la política lo exige.

### 7. Algoritmos

- Algoritmo recomendado: `AES-256-GCM`.
- El campo `_a` permite introducir futuros algoritmos (incluyendo híbridos post-cuánticos) sin romper compatibilidad.

### 8. Consideraciones de seguridad

- La clave de sesión no debe almacenarse en claro en disco del lado cliente.
- Se recomienda que la clave sea válida sólo mientras dura la sesión.
- La rotación de claves y expiración debe definirse según las políticas de seguridad de la aplicación.

