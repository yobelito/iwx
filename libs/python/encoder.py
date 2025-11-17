from .schema_loader import get_schema
from .errors import ERROR_CODES, IWXError


def _validate_value(field: dict, obj: dict, source: str):
    key = field['backend'] if source == 'backend' else field['frontend']
    value = obj.get(key)
    if field.get('required') and value is None:
        raise IWXError(ERROR_CODES['MISSING_REQUIRED'], f'Missing required field {key}', {'field': field})
    ftype = field.get('type')
    if ftype:
        if ftype == 'string' and value is not None and not isinstance(value, str):
            raise IWXError(ERROR_CODES['TYPE_MISMATCH'], f'Expected string for {key}')
        if ftype == 'number' and value is not None and not isinstance(value, (int, float)):
            raise IWXError(ERROR_CODES['TYPE_MISMATCH'], f'Expected number for {key}')
        if ftype == 'integer' and value is not None and not isinstance(value, int):
            raise IWXError(ERROR_CODES['TYPE_MISMATCH'], f'Expected integer for {key}')
        if ftype == 'boolean' and value is not None and not isinstance(value, bool):
            raise IWXError(ERROR_CODES['TYPE_MISMATCH'], f'Expected boolean for {key}')
    return value


def _build_values(schema: dict, obj_front: dict, source: str):
    max_pos = max((field['pos'] for field in schema['fields']), default=-1)
    values = [None] * (max_pos + 1)
    for field in schema['fields']:
        values[field['pos']] = _validate_value(field, obj_front, source)
    return values


def iwx_encode_plain(schema_id: int, obj_front: dict, *, source: str = 'frontend') -> dict:
    """Convert a frontend/backend object to a plain IWX payload {_s,_v}."""
    schema = get_schema(schema_id)
    values = _build_values(schema, obj_front, source)
    return {'_s': schema_id, '_v': values}
