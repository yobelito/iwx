# IWX – Index Wire eXchange Protocol
## Whitepaper v1.0

### Resumen

IWX es un protocolo de transporte compacto basado en índices, diseñado para:

- Reducir el tamaño de los payloads.
- No exponer directamente los nombres internos de campos.
- Permitir alias diferentes en frontend y backend.
- Ofrecer un perfil de cifrado interno (IWX-Secure) que complemente a TLS.
- Preparar el terreno para perfiles binarios y, a futuro, algoritmos post-cuánticos.

### Motivación

La mayoría de APIs modernas usan JSON con objetos verbosos, repitiendo nombres de campos
en cada payload. Esto:

- Incrementa el tamaño de los mensajes.
- Expone la estructura interna de datos del backend.
- Depende completamente de TLS para la confidencialidad.

IWX propone:

1. Representar los datos como arrays indexados.
2. Resolver la semántica a través de esquemas (`schema_id`).
3. Permitir un perfil seguro en el que los valores se cifran con una clave de sesión.

### Arquitectura

1. **Cliente**:
   - Usa esquemas para mapear campos de UI a posiciones.
   - Codifica los datos en un payload IWX `{_s,_v}`.
   - Opcionalmente aplica IWX-Secure (AES-256-GCM) a `_v`.
2. **Servidor**:
   - Usa `schema_id` para cargar el esquema correspondiente.
   - Reconstruye un objeto de dominio usando los nombres `backend`.
   - Aplica lógica de negocio.

### Conclusión

IWX no pretende reemplazar protocolos existentes, sino ofrecer una capa de representación
compacta y flexible, fácil de adoptar gradualmente en sistemas actuales.

