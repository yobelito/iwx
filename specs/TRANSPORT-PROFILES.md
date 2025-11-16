# Perfiles de Transporte IWX

IWX define actualmente dos perfiles principales de transporte:

- **IWX-JSON**: usa JSON como contenedor.
- **IWX-BIN**: usa un frame binario compacto.

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

