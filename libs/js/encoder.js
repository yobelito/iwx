// IWX encoder/decoder utilities (JSON profile)
import { ERROR_CODES, IwxError } from './errors.js';
import { getSchema } from './schema-loader.js';

function validateValueType(expected, value) {
  if (value === null || value === undefined) return true;
  switch (expected) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'integer':
      return Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'date':
      return typeof value === 'string' || value instanceof Date;
    case 'object':
      return typeof value === 'object';
    default:
      return true;
  }
}

function mapFieldValue(field, source, obj) {
  const key = source === 'backend' ? field.backend : field.frontend;
  const value = Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : null;
  if (field.required && (value === null || value === undefined)) {
    throw new IwxError(ERROR_CODES.MISSING_REQUIRED, `Missing required field ${key}`, { field });
  }
  if (field.type && !validateValueType(field.type, value)) {
    throw new IwxError(ERROR_CODES.TYPE_MISMATCH, `Invalid type for ${key}`, { expected: field.type, value });
  }
  return value;
}

function buildValues(schema, obj, source) {
  const values = [];
  for (const field of schema.fields) {
    values[field.pos] = mapFieldValue(field, source, obj);
  }
  return values;
}

export function iwxEncodePlain(schemaId, sourceObject, options = {}) {
  const { source = 'frontend' } = options;
  const schema = getSchema(schemaId);
  return { _s: schemaId, _v: buildValues(schema, sourceObject, source) };
}

export function iwxDecode(payload, options = {}) {
  const { target = 'frontend' } = options;
  const schema = getSchema(payload._s);
  const values = payload._v || [];
  const obj = {};
  for (const field of schema.fields) {
    const value = values[field.pos] ?? null;
    const key = target === 'backend' ? field.backend : field.frontend;
    obj[key] = value;
  }
  return obj;
}

export function iwxDecodeToFront(payload) {
  return iwxDecode(payload, { target: 'frontend' });
}

export function iwxDecodeToBackend(payload) {
  return iwxDecode(payload, { target: 'backend' });
}
