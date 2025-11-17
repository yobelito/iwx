# IWX — Protocolo Index Wire eXchange
**Versión: 1.0.0 (Borrador)** · **Licencia: Apache 2.0**

IWX es un formato de transporte compacto basado en esquemas que reemplaza los objetos JSON verbosos por arreglos de valores direccionados por posición. El protocolo separa alias de frontend y nombres de backend, admite cifrado opcional mediante el perfil IWX-Secure y define perfiles de transporte JSON y binario.

- **Idioma oficial:** Inglés (este archivo es una traducción de apoyo).
- **Especificaciones primarias:** [`specs/IWX-SPEC-v1.0.md`](specs/IWX-SPEC-v1.0.md) · [`specs/IWX-SECURE-v1.0.md`](specs/IWX-SECURE-v1.0.md) · [`specs/TRANSPORT-PROFILES.md`](specs/TRANSPORT-PROFILES.md) · [`specs/SCHEMA-SPEC.md`](specs/SCHEMA-SPEC.md)
- **Librerías:** Implementaciones de referencia en JavaScript (ESM), Python y PHP en [`libs/`](libs/)

---

## Capacidades clave
- **Representación compacta:** los valores viven en `_v` siguiendo índices `pos` definidos por el id de esquema `_s`.
- **Separación frontend/backend:** los esquemas mapean alias públicos a campos internos para evitar fugas de nombres.
- **Perfil seguro:** cifrado AES-256-GCM opcional para `_v` con `_k` (id de clave), `_a` (algoritmo), `_iv` (nonce) y `_v` (cifrado).
- **Transporte binario:** trama (`IWX` + versión + id de esquema + conteos + valores en JSON) para mayor eficiencia.
- **Extensible:** versionado por esquema, perfiles de transporte (JSON, BIN) y compatibilidad futura con PQ en `_a`.

---

## Instalación
### JavaScript (Browser/Node ESM)
```
npm install iwx-protocol  # próximamente; usar libs/js como referencia
```

### Python
```
pip install iwx  # planificado; usar libs/python como referencia
```

### PHP
```
composer require iwx-protocol/iwx  # planificado; usar libs/php como referencia
```

---

## Anatomía del payload
```json
{
  "_s": <schema_id>,
  "_v": [<valores_por_posicion>]
}
```
- `_s`: identificador del esquema (desde el registro)
- `_v`: valores ordenados por `pos` según el esquema

Perfil seguro:
```json
{
  "_s": 1,
  "_k": "iwx-ks-123",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext_of_json(_v))"
}
```

Trama binaria (IWX-BIN v1):
```
[MAGIC="IWX"][VER=0x01][SCHEMA:uint16][COUNT:uint16][LEN:uint32][JSON(_v) bytes]
```

---

## Ejemplos rápidos
### JavaScript (plain → JSON IWX)
```js
import { iwxEncodePlain, iwxDecodeToBackend } from "./libs/js/encoder.js";
const sale = { tenant: "t-001", sale_date: "2025-01-01", amount: 199.9 };
const payload = iwxEncodePlain(1, sale);
const backendObj = iwxDecodeToBackend(payload);
```

### Python (decodificación a backend)
```python
from libs.python.decoder import iwx_decode_to_backend
payload = {"_s": 1, "_v": ["t-001", "2025-01-01", 199.9]}
backend = iwx_decode_to_backend(payload)
```

### PHP (perfil seguro)
```php
use IWXSecureEncoder;
use IWXDecoder;
$key = random_bytes(32);
$payload = IWXSecureEncoder::wrapSecure(1, ['tenant' => 't-001'], $key, 'iwx-ks-123');
$decoded = IWXSecureEncoder::unwrapSecure($payload, $key, 'backend');
```

### Transporte binario (Python)
```python
from libs.python.binary import iwx_bin_encode, iwx_bin_decode
raw = iwx_bin_encode({"_s": 1, "_v": ["t-001", "2025-01-01", 199.9]})
payload = iwx_bin_decode(raw)
```

---

## Gestión de esquemas y separación frontend/backend
- Mantén los esquemas canónicos (con nombres backend y reglas de validación) únicamente en el servidor dentro de `schemas/`.
- El frontend solo necesita el `schema_id` (`_s`) y el orden de los valores (`_v`); si requiere etiquetas, expón un manifiesto reducido con los alias `frontend` y posiciones, sin los nombres `backend`.
- Los esquemas de ejemplo incluidos (p. ej. `Sale` con `frontend: "amount"` y `backend: "total"`) sirven para mostrar cómo se mapean alias públicos a campos internos; en producción, carga tus propios esquemas desde disco y solo comparte el manifiesto reducido al navegador.
- Los SDKs pueden precargar esquemas desde archivos JSON o YAML:
  - JS: `loadSchemasFromDirectory('./schemas', { yamlParser: yaml })`
  - Python: `load_schemas_from_dir('schemas', yaml.safe_load)`
  - PHP: `IWXSchemaLoader::loadSchemasFromDirectory('schemas', 'yaml_parse')`
- Guardar los esquemas en archivos (JSON/YAML) permite revisar cambios y mantenerlos fuera del bundle del cliente; el servidor carga y valida al arrancar.
- Para un flujo paso a paso de frontend/back sin exponer el esquema completo, consulta [`docs/frontend-backend-ejemplo.md`](docs/frontend-backend-ejemplo.md).

---

## Consideraciones de seguridad
- AES-256-GCM requiere claves de 32 bytes e IVs de 12 bytes; siempre usar IVs únicos por mensaje.
- Registrar `_k` (ids de clave) para rotación y usar `_a` para indicar el algoritmo/perfil.
- Validar esquemas y campos requeridos antes de codificar y después de decodificar.
- Mantener TLS/HTTPS además del cifrado de payload.

---

## Versionado y hoja de ruta
- **Borrador actual:** v1.0 (JSON + Secure + BIN inicial)
- **v1.1 planeada:** códec BIN final, CLI `iwx-inspect`, CLI validador de esquemas, generadores automáticos.
- **Futuro 2.0:** perfil seguro PQ-ready, bindings WebAssembly, descubrimiento de esquemas vía registro, estructura tipo RFC.

---

## Mapa del repositorio
- `specs/`: especificaciones de protocolo, perfil seguro, transporte y esquemas
- `libs/js`, `libs/python`, `libs/php`: librerías de referencia (plain, secure, binario)
- `schemas/`: esquemas de ejemplo
- `docs/`: documentación y estado
- `examples/`, `papers/`: fragmentos de uso y borrador del whitepaper

---

## Contribuir
Se aceptan PRs para feedback de protocolo, nuevos lenguajes, mejoras de seguridad y documentación. Alinear cambios con las especificaciones publicadas e incluir pruebas cuando sea posible.

## Licencia
Apache License 2.0 (ver [`LICENSE`](LICENSE)).
