# IWX — Index Wire eXchange Protocol
**Version: 1.0.0 (Draft)** · **License: Apache 2.0**

IWX is a compact, schema-indexed wire format that replaces verbose JSON objects with positionally addressed value arrays. The protocol cleanly separates frontend aliases from backend names, supports encrypted payloads through the IWX-Secure profile, and defines JSON and binary transports.

- **Official language:** English (Spanish translation available in [`README.es.md`](README.es.md)).
- **Primary specifications:** [`specs/IWX-SPEC-v1.0.md`](specs/IWX-SPEC-v1.0.md) · [`specs/IWX-SECURE-v1.0.md`](specs/IWX-SECURE-v1.0.md) · [`specs/TRANSPORT-PROFILES.md`](specs/TRANSPORT-PROFILES.md) · [`specs/SCHEMA-SPEC.md`](specs/SCHEMA-SPEC.md)
- **Libraries:** JavaScript (ESM), Python, PHP implementations under [`libs/`](libs/)

---

## Key capabilities
- **Compact representation:** values live in `_v` following positional `pos` indexes defined by the schema id `_s`.
- **Frontend/backed mapping:** schemas map public aliases to backend fields so neither side leaks internal naming.
- **Secure profile:** optional AES-256-GCM encryption for `_v` with `_k` (key id), `_a` (algorithm), `_iv` (nonce), `_v` (ciphertext).
- **Binary transport:** framed payload (`IWX` magic + version + schema id + counts + JSON-encoded values) for extra efficiency.
- **Extensible:** per-schema versioning, transport profiles (JSON, BIN), forward-looking PQ crypto slot via `_a`.

---

## Installation
### JavaScript (Browser/Node ESM)
```
npm install iwx-protocol  # coming soon; use libs/js for reference
```

### Python
```
pip install iwx  # planned; use libs/python for reference
```

### PHP
```
composer require iwx-protocol/iwx  # planned; use libs/php for reference
```

---

## Payload anatomy
```json
{
  "_s": <schema_id>,
  "_v": [<values_by_position>]
}
```
- `_s`: schema identifier (from registry)
- `_v`: values ordered by `pos` as defined in the schema

Secure profile wrapper:
```json
{
  "_s": 1,
  "_k": "iwx-ks-123",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext_of_json(_v))"
}
```

Binary framing (IWX-BIN v1):
```
[MAGIC="IWX"][VER=0x01][SCHEMA:uint16][COUNT:uint16][LEN:uint32][JSON(_v) bytes]
```

---

## Schema basics
Schemas live under [`schemas/`](schemas/) and follow [`specs/SCHEMA-SPEC.md`](specs/SCHEMA-SPEC.md). Example (`schemas/sale/schema.json`):
```json
{
  "schema_id": 1,
  "fields": [
    {"pos": 0, "frontend": "tenant", "backend": "tenant_id", "type": "string", "required": true},
    {"pos": 1, "frontend": "sale_date", "backend": "date", "type": "date", "required": true},
    {"pos": 2, "frontend": "amount", "backend": "total", "type": "number", "required": true}
  ]
}
```

---

## Quick usage examples
### JavaScript (plain → IWX JSON)
```js
import { iwxEncodePlain, iwxDecodeToBackend } from "./libs/js/encoder.js";

const sale = { tenant: "t-001", sale_date: "2025-01-01", amount: 199.9 };
const payload = iwxEncodePlain(1, sale);
// { _s: 1, _v: ["t-001", "2025-01-01", 199.9] }

const backendObj = iwxDecodeToBackend(payload);
// { tenant_id: "t-001", date: "2025-01-01", total: 199.9 }
```

### Python (backend object from payload)
```python
from libs.python.decoder import iwx_decode_to_backend
payload = {"_s": 1, "_v": ["t-001", "2025-01-01", 199.9]}
backend = iwx_decode_to_backend(payload)
# {'tenant_id': 't-001', 'date': '2025-01-01', 'total': 199.9}
```

### PHP (secure encode/decode)
```php
use IWXSecureEncoder;
use IWXDecoder;

$key = random_bytes(32); // session key
$payload = IWXSecureEncoder::wrapSecure(1, ['tenant' => 't-001'], $key, 'iwx-ks-123');
$decoded = IWXSecureEncoder::unwrapSecure($payload, $key, 'backend');
// returns backend associative array
```

### Binary transport (Python example)
```python
from libs.python.binary import iwx_bin_encode, iwx_bin_decode
raw = iwx_bin_encode({"_s": 1, "_v": ["t-001", "2025-01-01", 199.9]})
payload = iwx_bin_decode(raw)
```

---

## Security considerations
- AES-256-GCM requires 32-byte keys and 12-byte IVs; always use unique IVs per message.
- Track `_k` (key ids) for rotation; `_a` identifies the algorithm/profile.
- Validate schemas and required fields before encoding/after decoding.
- Use HTTPS/TLS for transport in addition to payload encryption.

---

## Versioning & roadmap
- **Current draft:** v1.0 (JSON + Secure + initial BIN framing)
- **Planned v1.1:** finalized BIN codec, `iwx-inspect` CLI, schema validator CLI, automatic schema generators.
- **Future 2.0:** PQ-ready secure profile, WebAssembly bindings, registry-backed schema discovery, IETF-style RFC layout.

---

## Repository map
- `specs/`: protocol, secure profile, transport, and schema specifications
- `libs/js`, `libs/python`, `libs/php`: reference libraries (plain, secure, binary)
- `schemas/`: example schemas
- `docs/`: documentation index and status
- `examples/`, `papers/`: usage snippets and whitepaper draft

---

## Contributing
Pull requests are welcome for protocol feedback, new language ports, security improvements, and documentation. Please align with the published specs and include tests where possible.

## License
Apache License 2.0 (see [`LICENSE`](LICENSE)).
