// Schema registry and validation utilities for IWX
import fs from 'fs';
import path from 'path';
import { ERROR_CODES, IwxError } from './errors.js';

const registry = new Map();
const ALLOWED_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'date', 'object']);

const builtInSchemas = [
  {
    schema_id: 1,
    name: 'Sale',
    version: 1,
    fields: [
      { pos: 0, frontend: 'tenant', backend: 'tenant_id', type: 'string', required: true },
      { pos: 1, frontend: 'sale_date', backend: 'date', type: 'date', required: true },
      { pos: 2, frontend: 'amount', backend: 'total', type: 'number', required: true }
    ]
  }
];

function validateSchemaDefinition(schema) {
  if (!schema || typeof schema.schema_id !== 'number' || !Array.isArray(schema.fields)) {
    throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'Schema must include schema_id and fields[]');
  }
  const seenPositions = new Set();
  for (const field of schema.fields) {
    if (typeof field.pos !== 'number') {
      throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'Field is missing numeric pos', { field });
    }
    if (seenPositions.has(field.pos)) {
      throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'Duplicate field position', { pos: field.pos });
    }
    seenPositions.add(field.pos);
    if (!field.frontend || !field.backend) {
      throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'Field requires frontend and backend names', { field });
    }
    if (field.type && !ALLOWED_TYPES.has(field.type)) {
      throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'Unsupported field type', { field });
    }
  }
}

export function registerSchema(schema) {
  validateSchemaDefinition(schema);
  registry.set(schema.schema_id, schema);
  return schema;
}

export function getSchema(schemaId) {
  const schema = registry.get(schemaId);
  if (!schema) {
    throw new IwxError(ERROR_CODES.SCHEMA_NOT_FOUND, `Unknown IWX schema: ${schemaId}`);
  }
  return schema;
}

export function listSchemas() {
  return Array.from(registry.values());
}

export function loadSchemaFile(filePath, { yamlParser } = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;
  if (ext === '.json') {
    parsed = JSON.parse(content);
  } else if (ext === '.yml' || ext === '.yaml') {
    if (!yamlParser) {
      throw new IwxError(
        ERROR_CODES.SCHEMA_INVALID,
        'YAML schema provided but no yamlParser supplied. Pass yamlParser.parse or pre-convert to JSON.',
        { filePath }
      );
    }
    parsed = yamlParser.parse(content);
  } else {
    throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'Unsupported schema file extension', { filePath });
  }
  return registerSchema(parsed);
}

export function loadSchemasFromDirectory(directoryPath, { yamlParser } = {}) {
  const files = fs.readdirSync(directoryPath, { withFileTypes: true });
  for (const entry of files) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (ext !== '.json' && ext !== '.yml' && ext !== '.yaml') continue;
    const filePath = path.join(directoryPath, entry.name);
    loadSchemaFile(filePath, { yamlParser });
  }
  return listSchemas();
}

// preload built-in examples
for (const schema of builtInSchemas) {
  if (!registry.has(schema.schema_id)) {
    registerSchema(schema);
  }
}
