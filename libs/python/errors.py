class IWXError(Exception):
    def __init__(self, code: str, message: str, details=None):
        super().__init__(message)
        self.code = code
        self.details = details or {}


ERROR_CODES = {
    'SCHEMA_NOT_FOUND': 'IWX_ERROR_SCHEMA_NOT_FOUND',
    'SCHEMA_INVALID': 'IWX_ERROR_SCHEMA_INVALID',
    'MISSING_REQUIRED': 'IWX_ERROR_MISSING_REQUIRED',
    'TYPE_MISMATCH': 'IWX_ERROR_TYPE_MISMATCH',
    'DECRYPTION_FAILED': 'IWX_ERROR_DECRYPTION_FAILED',
    'BINARY_FORMAT': 'IWX_ERROR_BINARY_FORMAT',
}
