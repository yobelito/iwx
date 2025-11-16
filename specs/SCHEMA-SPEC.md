# Especificación de Esquemas IWX

Los esquemas IWX se definen como documentos JSON que describen:

- El nombre lógico del modelo.
- Un identificador de esquema (`schema_id`).
- Una versión de esquema.
- La lista de campos, con su posición y metadatos.

## 1. Estructura general

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
    }
  ]
}
```

### Campos

- `name`: nombre lógico del modelo (string).
- `schema_id`: identificador numérico único del esquema.
- `version`: versión humana del esquema (puede coincidir o no con `schema_id`).
- `fields`: array de definición de campos.

Cada elemento de `fields`:

- `pos` (number): índice entero empezando en 0. Define la posición en el array `_v`.
- `backend` (string): nombre interno que se usará en el backend.
- `frontend` (string, opcional): alias o nombre usado en el frontend.
- `type` (string): tipo lógico (`string`, `number`, `boolean`, `date`).
- `required` (boolean): indica si el campo es obligatorio.

## 2. Reglas

1. Los valores de `pos` deben ser únicos dentro del mismo esquema.
2. Se recomienda que `pos` sea consecutivo (0, 1, 2, ...) aunque no es estrictamente obligatorio.
3. `schema_id` debe ser único dentro del conjunto de esquemas de una aplicación.
4. Cambios incompatibles deben producir un nuevo `schema_id`.

