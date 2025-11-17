# Perfiles de Transporte IWX

IWX define actualmente dos perfiles principales de transporte:

- **IWX-JSON**: usa JSON como contenedor.
- **IWX-BIN**: usa un frame binario compacto.
- **IWX-JSONL**: usa eventos JSON delimitados por nuevas líneas para streaming.

## 1. IWX-JSON

- `Content-Type: application/vnd.iwx+json`
- Payload con la forma descrita en `IWX-SPEC-v1.0.md`.
- Fácil de depurar.
- Ideal para APIs públicas y paneles de administración.

Ejemplo (plain):

```json
{
  "_s": 1,
  "_v": ["t-001", "2025-01-01", 199.9]
}
```

Ejemplo (secure):

```json
{
  "_s": 1,
  "_k": "iwx-ks-123",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext)"
}
```

## 2. IWX-BIN (experimental)

- `Content-Type: application/vnd.iwx+bin`
- Usa un frame binario con la siguiente estructura general:

```
[MAGIC][VER][SCHEMA_ID][COUNT][VALUES...]
```

Donde:

- `MAGIC`: bytes de identificación, p.ej. `0x49 0x57 0x58 0x31` (`"IWX1"`).
- `VER`: versión del frame binario (1 byte).
- `SCHEMA_ID`: entero sin signo (2 o 4 bytes).
- `COUNT`: número de valores (2 bytes).
- `VALUES`: secuencia de valores codificados con etiqueta de tipo.

Cada valor puede tener formato:

```
[TYPE][LEN][DATA...]
```

donde:

- `TYPE`: byte que indica el tipo lógico (string, number, boolean, etc.).
- `LEN`: longitud en bytes del campo `DATA` (para tipos de longitud variable).
- `DATA`: bytes del valor.

El detalle exacto de la codificación binaria puede evolucionar en futuras versiones, siempre manteniendo:

- Compatibilidad hacia atrás cuando sea posible.
- Sincronización semántica con los esquemas y `schema_id`.

IWX-BIN está destinado principalmente a:

- Comunicación interna entre servicios.
- Sincronización móvil / edge.
- Colas de mensajes y streaming.

## 3. IWX-JSONL (propuesto)

- `Content-Type: application/vnd.iwx+jsonl`
- Basado en *newline-delimited JSON* (`NDJSON`), donde cada línea es un payload IWX independiente.
- Ideal para streaming en HTTP chunked, WebSockets o colas de logs donde los mensajes se procesan uno a uno.

Ejemplo (dos eventos en el mismo stream):

```json
{"_s": 1, "_v": ["t-001", "2025-01-01", 199.9]}
{"_s": 1, "_v": ["t-002", "2025-01-02", 59.5]}
```

Guías de implementación:

- Cada línea debe terminar con `\n` y ser un JSON válido según `IWX-SPEC-v1.0.md`.
- El consumidor debe tratar cada línea como un mensaje autónomo y validar la longitud de `_v` antes de decodificar.
- Para flows seguros, el formato por línea incluye `_k`, `_a`, `_iv` y `_v` cifrado igual que IWX-JSON.
- Se recomienda limitar el tamaño máximo por línea para evitar abusos en streams largos.

Casos de uso:

- Ingesta de eventos o telemetría en tiempo real.
- Jobs batch que procesan millones de registros sin cargar todo el archivo en memoria.
- Debugging y replay de tráfico registrando cada línea como un mensaje reproducible.

