// Simple loader de esquemas IWX en el frontend.
// En un proyecto real podrías generar esto a partir de JSON o importarlo como módulo.

export const IWX_SCHEMAS = {
  1: {
    name: "Sale",
    fields: [
      { pos: 0, frontend: "tenant",  backend: "tenant_id" },
      { pos: 1, frontend: "sale_date", backend: "date" },
      { pos: 2, frontend: "amount", backend: "total" }
    ]
  }
};

export function getSchema(schemaId) {
  const schema = IWX_SCHEMAS[schemaId];
  if (!schema) {
    throw new Error("Unknown IWX schema: " + schemaId);
  }
  return schema;
}
