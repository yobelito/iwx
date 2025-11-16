from .schema_loader import get_schema


def iwx_encode_plain(schema_id: int, obj_front: dict) -> dict:
    """Convierte un objeto de frontend a payload IWX plain {_s,_v}."""
    schema = get_schema(schema_id)
    max_pos = max(field["pos"] for field in schema["fields"])
    values = [None] * (max_pos + 1)

    for field in schema["fields"]:
        pos = field["pos"]
        key = field["frontend"]
        values[pos] = obj_front.get(key)

    return {"_s": schema_id, "_v": values}
