# IWX schema management and visibility

This guide clarifies how to keep backend-only schema definitions while still enabling frontend developers to encode payloads.

## Backend-only canonical schemas

* Keep the canonical schemas (with backend field names and validation rules) on the server, typically under `schemas/`.
* Do **not** ship the backend schema files to the browser. The client only needs to know the schema ID (`_s`) and the ordered value list (`_v`).
* If the frontend requires field prompts or labels, generate a minimal "frontend manifest" that only contains the public-facing `frontend` keys and ordering, not the backend field names.

### Why do the built-in examples include `frontend` and `backend`?

The bundled sample schemas (e.g., `Sale` with `frontend: "amount"` and `backend: "total"`) exist only to demonstrate the mapping between public aliases and internal field names. They are preloaded for quick examples and tests, but production deployments should load their own canonical schemas from disk and only expose a reduced manifest to the browser. In other words, the frontend uses the `frontend` aliases and positions, while the backend uses the `backend` names during decoding and persistence.

## Loading schemas from files

All language SDKs can pre-load schemas from disk so you do not have to hard-code definitions:

```bash
# JSON example
schemas/
  sale.json
  invoice.json
```

*JavaScript*

```js
import { loadSchemasFromDirectory } from '../libs/js/schema-loader.js';
loadSchemasFromDirectory('./schemas');
```

*Python*

```py
from libs.python.schema_loader import load_schemas_from_dir
load_schemas_from_dir('schemas')
```

*PHP*

```php
IWXSchemaLoader::loadSchemasFromDirectory(__DIR__ . '/schemas');
```

### YAML option

If you prefer YAML, pass a parser helper when calling the loader:

* JS: `loadSchemasFromDirectory('./schemas', { yamlParser: yaml })`
* Python: `load_schemas_from_dir('schemas', yaml.safe_load)`
* PHP: `IWXSchemaLoader::loadSchemasFromDirectory('schemas', 'yaml_parse')`

## Frontend developer workflow

1. The backend publishes the allowed schema IDs plus a minimal manifest with public field names and ordering.
2. The frontend uses that manifest to build forms and then encodes values as `[value0, value1, ...]` with `_s` set to the schema ID.
3. The backend decoder maps `frontend` names back to `backend` names using the canonical schema and persists or processes the data.

This keeps backend naming, validation, and business rules hidden while the frontend only interacts with the stable schema ID and ordered value list.
