# Frontend/backend flow without exposing the full schema

This step-by-step example shows how a user registration form can operate without the browser knowing the backend canonical schema. The approach uses a **reduced manifest** for the frontend and keeps the full definition on the server.

## 1. Scenario

- Entity: `usuarios`
- Backend fields: `nombre`, `apellidos`, `edad`, `activo`.
- Transport profile: IWX-JSON (though the flow is analogous for IWX-BIN).

## 2. Canonical schema (backend only)

Stored on the server (e.g., `schemas/usuarios.json`), with internal names and validation:

```json
{
  "id": "usuarios.v1",
  "fields": [
    { "pos": 0, "backend": "nombre", "type": "string", "required": true },
    { "pos": 1, "backend": "apellidos", "type": "string", "required": true },
    { "pos": 2, "backend": "edad", "type": "int", "required": true },
    { "pos": 3, "backend": "activo", "type": "bool", "required": true }
  ]
}
```

This file is not sent to the browser; it is used to validate and map `_v` to real names on the backend.

## 3. Reduced manifest (frontend)

The backend publishes only public aliases and positions. It can be a JSON served by a static route or embedded in the web app:

```json
{
  "id": "usuarios.v1",
  "fields": [
    { "pos": 0, "frontend": "Nombre" },
    { "pos": 1, "frontend": "Apellidos" },
    { "pos": 2, "frontend": "Edad" },
    { "pos": 3, "frontend": "Activo" }
  ]
}
```

- The frontend uses `frontend` to label inputs and `pos` to order values.
- Internal names (`backend`) and sensitive validation rules are not exposed.

## 4. Step-by-step flow

1) **Backend** keeps the canonical schema in `schemas/` and registers `schema_id = "usuarios.v1"`.

2) **Backend** exposes to the frontend the allowed schema list and the reduced manifest (only `frontend` + `pos`).

3) **Frontend** generates the form using those aliases; field order follows `pos`.

4) **Frontend** on submit builds the IWX payload:
   ```json
   { "_s": "usuarios.v1", "_v": ["Ada", "Lovelace", 31, true] }
   ```

5) **Frontend SDK** (encoder) receives `_s` and `_v`. It may validate expected length with the reduced manifest but does not need the internal schema.

6) **Backend** decodes with the canonical schema, maps positions to `backend` (`nombre`, `apellidos`, `edad`, `activo`) and applies validations. On failure, it returns an appropriate `IWX_ERROR_*`.

7) **Backend** processes/stores the data and responds to the frontend.

## 5. Why does this work as a "security layer"?

- The frontend only knows public aliases and ordering, not internal semantics or complete rules.
- Internal changes (e.g., renaming `activo` to `status` or adjusting validations) happen in the canonical schema without repackaging the client, as long as `schema_id` is stable or a new version is published.
- The reduced manifest can be cached or signed if extra integrity is required.

## 6. Options to distribute the manifest

- **Static file**: the backend generates `public-manifest.json` from canonical schemas and serves it as a public resource.
- **Metadata API**: endpoint `/iwx/manifests` returning allowed manifests based on user role.
- **Embedded in the build**: during frontend build, inject a JSON with aliases and positions.

## 7. Relationship with IWX libraries

- **Frontend**: uses the encoder to produce `_s` + `_v` based on the reduced manifest. It does not need the full `SchemaLoader`, only the `pos -> alias` table provided.
- **Backend**: uses `SchemaLoader` and validators to resolve `schema_id` to the canonical schema, validate types, and emit structured errors.
- **Secure (optional)**: if field encryption is required, the frontend receives necessary public keys/IV; the backend keeps secrets and validates `_k`, `_a`, `_iv`, `_v` according to IWX-SECURE.

## 8. Quick summary

- Keep full schemas on the server.
- Expose only public aliases and positions to the frontend.
- The frontend sends `_s` + `_v` in order; the backend resolves everything else.
- IWX libraries are designed for this separation model.
