# Flujo frontend/backend sin exponer el esquema completo

Este ejemplo paso a paso muestra cómo un formulario de registro de usuarios puede operar sin que el navegador conozca los detalles internos del esquema canónico del backend. El enfoque usa un **manifiesto reducido** para el frontend y mantiene la definición completa solo en el servidor.

## 1. Escenario

- Entidad: `usuarios`
- Campos internos del backend: `nombre`, `apellidos`, `edad`, `activo`.
- Perfil de transporte: IWX-JSON (aunque el flujo es análogo para IWX-BIN).

## 2. Esquema canónico (solo backend)

Guardado en el servidor (p. ej., `schemas/usuarios.json`), con nombres y validaciones internas:

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

Este archivo no se envía al navegador; se usa para validar y mapear `_v` a los nombres reales en el backend.

## 3. Manifiesto reducido (frontend)

El backend publica únicamente alias públicos y posiciones. Puede ser un JSON servido por una ruta estática o incrustado en la app web:

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

- El frontend usa `frontend` para etiquetar inputs y `pos` para ordenar los valores.
- No se exponen nombres internos (`backend`) ni reglas de validación sensibles.

## 4. Flujo paso a paso

1) **Backend** mantiene el esquema canónico en `schemas/` y registra `schema_id = "usuarios.v1"`.

2) **Backend** expone al frontend la lista de esquemas permitidos y el manifiesto reducido (solo `frontend` + `pos`).

3) **Frontend** genera el formulario usando esos alias; el orden de los campos sigue `pos`.

4) **Frontend** al enviar construye el payload IWX:
   ```json
   { "_s": "usuarios.v1", "_v": ["Ada", "Lovelace", 31, true] }
   ```

5) **SDK Frontend** (encoder) recibe `_s` y `_v`. Puede validar la longitud esperada usando el manifiesto reducido, pero no necesita conocer el esquema interno.

6) **Backend** decodifica con el esquema canónico, mapea las posiciones a `backend` (`nombre`, `apellidos`, `edad`, `activo`) y aplica validaciones. Si algo falla, devuelve un `IWX_ERROR_*` adecuado.

7) **Backend** procesa/almacena los datos y responde al frontend.

## 5. ¿Por qué funciona como "capa de seguridad"?

- El frontend solo conoce alias públicos y el orden, no la semántica interna ni las reglas completas.
- Cambios internos (p. ej., renombrar `activo` a `status` o ajustar validaciones) ocurren en el esquema canónico sin reempacar el cliente, siempre que se mantenga `schema_id` o se publique una nueva versión.
- El manifiesto reducido se puede cachear o firmar si se requiere integridad adicional.

## 6. Opciones de distribución del manifiesto

- **Archivo estático**: el backend genera `public-manifest.json` a partir de los esquemas canónicos y lo sirve como recurso público.
- **API de metadatos**: endpoint `/iwx/manifests` que devuelve los manifiestos permitidos según rol del usuario.
- **Incrustado en el build**: durante el build del frontend se inyecta un JSON con los alias y posiciones.

## 7. Relación con las bibliotecas IWX

- **Frontend**: usa el encoder para crear `_s` + `_v` basándose en el manifiesto reducido. No necesita `SchemaLoader` completo, solo la tabla `pos -> alias` que recibe.
- **Backend**: usa `SchemaLoader` y los validadores para resolver `schema_id` al esquema canónico, validar tipos y emitir errores estructurados.
- **Seguro (opcional)**: si se requiere cifrado de campos, el frontend recibe claves/IV públicas necesarias; el backend mantiene los secretos y valida `_k`, `_a`, `_iv`, `_v` conforme a IWX-SECURE.

## 8. Resumen rápido

- Mantén los esquemas completos en el servidor.
- Expón al frontend solo alias públicos y posiciones.
- El frontend envía `_s` + `_v` en orden; el backend resuelve todo lo demás.
- Las bibliotecas IWX están diseñadas para este modelo de separación.
