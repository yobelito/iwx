// IWX decoder (JSON, modo plain)
// Convierte un payload IWX {_s,_v} a un objeto de frontend

import { getSchema } from "./schema-loader.js";

/**
 * @param {{_s:number,_v:any[]}} payload
 * @returns {object} objeto usando campos de frontend
 */
export function iwxDecodeToFront(payload) {
  const schemaId = payload._s;
  const values = payload._v;
  const schema = getSchema(schemaId);

  const obj = {};
  for (const field of schema.fields) {
    obj[field.frontend] = values[field.pos] ?? null;
  }
  return obj;
}
