# Estado del repositorio IWX (borrador v1.0)

## Contenido actual
- Especificaciones base del protocolo: `specs/IWX-SPEC-v1.0.md`, `specs/IWX-SECURE-v1.0.md`, `specs/TRANSPORT-PROFILES.md`, `specs/SCHEMA-SPEC.md`.
- Ejemplo de esquema de referencia (`schemas/sale/schema.json`) y bibliotecas mínimas de JavaScript, Python y PHP en `libs/`.
- Borrador inicial del whitepaper en `papers/` y ejemplos en `examples/`.

## Vacíos y trabajo pendiente
- Validación robusta de esquemas (banderas de requerido, enforcement de tipos, posiciones duplicadas) pendiente.
- Helpers del perfil seguro incompletos en PHP y mínimos en JS/Python.
- Transporte binario (IWX-BIN) sin framing ni utilidades de codec en los lenguajes soportados.
- Códigos de error y excepciones estructuradas aún no expuestos en las bibliotecas.
- Documentación principalmente en español y con carencia de referencias de API, pasos de instalación y detalles de roadmap.

## Hoja de ruta para completar
1. **Cumplimiento del protocolo**: aplicar validación de esquemas, campos requeridos y checks de tipo en encoders/decoders; añadir códigos de error estructurados.
2. **Perfil seguro**: implementar helpers AES-256-GCM de forma consistente (key-id, etiqueta de algoritmo, manejo de IV) y documentar la operación.
3. **Transporte binario**: publicar un framing compartido (magic + version + schema + counts + valores codificados en JSON) con codecs para JS/Python/PHP.
4. **Documentación**: ofrecer README en inglés como primera referencia y guías de API/uso con traducción al español para el usuario final.
5. **Herramientas y pruebas**: agregar tests ligeros para manejo de esquemas, codificación/decodificación y round-trips seguros en cada lenguaje; introducir CLI stubs (`iwx-inspect`, validador de esquemas) en la ruta a 1.1.
