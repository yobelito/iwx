// IWX encoder (JSON, modo plain)
// Convierte un objeto de frontend a payload IWX {_s, _v}

import { getSchema } from "./schema-loader.js";

/**
 * @param {number} schemaId
 * @param {object} frontObject - objeto usando campos de frontend
 * @returns {{_s:number,_v:any[]}}
 */
export function iwxEncodePlain(schemaId, frontObject) {
  const schema = getSchema(schemaId);
  const values = [];

  for (const field of schema.fields) {
    const key = field.frontend;
    const pos = field.pos;
    values[pos] = Object.prototype.hasOwnProperty.call(frontObject, key)
      ? frontObject[key]
      : null;
  }

  return {
    _s: schemaId,
    _v: values
  };
}
