export class IwxError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.name = 'IwxError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  SCHEMA_NOT_FOUND: 'IWX_ERROR_SCHEMA_NOT_FOUND',
  SCHEMA_INVALID: 'IWX_ERROR_SCHEMA_INVALID',
  MISSING_REQUIRED: 'IWX_ERROR_MISSING_REQUIRED',
  TYPE_MISMATCH: 'IWX_ERROR_TYPE_MISMATCH',
  DECRYPTION_FAILED: 'IWX_ERROR_DECRYPTION_FAILED',
  BINARY_FORMAT: 'IWX_ERROR_BINARY_FORMAT'
};
