from .schema_loader import get_schema


def _decode(payload: dict, target: str) -> dict:
    schema = get_schema(payload['_s'])
    values = payload.get('_v', [])
    obj = {}
    for field in schema['fields']:
        key = field['backend'] if target == 'backend' else field['frontend']
        obj[key] = values[field['pos']] if field['pos'] < len(values) else None
    return obj


def iwx_decode_to_backend(payload: dict) -> dict:
    """Convert {_s,_v} to backend-facing keys."""
    return _decode(payload, 'backend')


def iwx_decode_to_front(payload: dict) -> dict:
    """Convert {_s,_v} to frontend-facing keys."""
    return _decode(payload, 'frontend')
