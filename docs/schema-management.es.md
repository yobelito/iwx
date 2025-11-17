# Gestión de esquemas IWX y visibilidad

Esta guía aclara cómo mantener definiciones de esquemas solo para backend mientras sigues permitiendo que el equipo frontend pueda codificar payloads.

## Esquemas canónicos solo backend

* Guarda los esquemas canónicos (con nombres de campo y reglas de validación del backend) en el servidor, típicamente en `schemas/`.
* **No** envíes los archivos de esquema del backend al navegador. El cliente solo necesita conocer el ID de esquema (`_s`) y la lista ordenada de valores (`_v`).
* Si el frontend requiere textos o etiquetas para los campos, genera un "manifiesto frontend" mínimo que contenga únicamente las claves públicas `frontend` y el orden, no los nombres de campos del backend.

### ¿Por qué los ejemplos incluyen `frontend` y `backend`?

Los esquemas de ejemplo incluidos (p. ej., `Sale` con `frontend: "amount"` y `backend: "total"`) existen únicamente para demostrar el mapeo entre alias públicos y nombres internos. Se precargan para ejemplos y pruebas rápidas, pero en producción deberías cargar tus propios esquemas canónicos desde disco y exponer solo un manifiesto reducido al navegador. En otras palabras, el frontend usa los alias `frontend` y las posiciones, mientras que el backend usa los nombres `backend` al decodificar y persistir datos.

## Cargar esquemas desde archivos

Todos los SDK pueden precargar esquemas desde disco para evitar hardcodear definiciones:

```bash
# Ejemplo JSON
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

### Opción YAML

Si prefieres YAML, pasa un helper de parser al llamar al loader:

* JS: `loadSchemasFromDirectory('./schemas', { yamlParser: yaml })`
* Python: `load_schemas_from_dir('schemas', yaml.safe_load)`
* PHP: `IWXSchemaLoader::loadSchemasFromDirectory('schemas', 'yaml_parse')`

## Flujo de trabajo para frontend

1. El backend publica los IDs de esquema permitidos más un manifiesto mínimo con nombres públicos y orden.
2. El frontend usa ese manifiesto para construir formularios y luego codifica valores como `[valor0, valor1, ...]` con `_s` configurado al ID del esquema.
3. El decodificador en backend mapea `frontend` a `backend` usando el esquema canónico y persiste o procesa los datos.

Esto mantiene ocultos el naming, la validación y las reglas de negocio del backend, mientras que el frontend solo interactúa con el ID de esquema estable y la lista ordenada de valores.
