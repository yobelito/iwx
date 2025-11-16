from .schema_loader import get_schema


def iwx_decode_to_backend(payload: dict) -> dict:
    """Convierte un payload IWX {_s,_v} a un objeto con nombres 'backend'."""
    schema_id = payload["_s"]
    values = payload["_v"]
    schema = get_schema(schema_id)

    obj = {}
    for field in schema["fields"]:
        pos = field["pos"]
        backend_name = field["backend"]
        obj[backend_name] = values[pos] if pos < len(values) else None

    return obj
