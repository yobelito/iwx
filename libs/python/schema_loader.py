import json
from pathlib import Path
from typing import Callable, Iterable
from .errors import ERROR_CODES, IWXError

ALLOWED_TYPES = {'string', 'number', 'integer', 'boolean', 'date', 'object'}
_registry = {}

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SCHEMA_PATH = BASE_DIR / 'schemas' / 'sale' / 'schema.json'

def _load_default_schemas():
    if DEFAULT_SCHEMA_PATH.exists():
        with DEFAULT_SCHEMA_PATH.open('r', encoding='utf-8') as fh:
            schema = json.load(fh)
            register_schema(schema)


def _validate_schema(schema: dict):
    if not isinstance(schema, dict) or 'schema_id' not in schema or 'fields' not in schema:
        raise IWXError(ERROR_CODES['SCHEMA_INVALID'], 'Schema must include schema_id and fields[]')
    seen_positions = set()
    for field in schema['fields']:
        pos = field.get('pos')
        if pos is None or not isinstance(pos, int):
            raise IWXError(ERROR_CODES['SCHEMA_INVALID'], 'Field is missing numeric pos', {'field': field})
        if pos in seen_positions:
            raise IWXError(ERROR_CODES['SCHEMA_INVALID'], 'Duplicate field position', {'pos': pos})
        seen_positions.add(pos)
        if not field.get('frontend') or not field.get('backend'):
            raise IWXError(ERROR_CODES['SCHEMA_INVALID'], 'Field requires frontend and backend names', {'field': field})
        ftype = field.get('type')
        if ftype and ftype not in ALLOWED_TYPES:
            raise IWXError(ERROR_CODES['SCHEMA_INVALID'], 'Unsupported field type', {'field': field})


def register_schema(schema: dict):
    _validate_schema(schema)
    _registry[schema['schema_id']] = schema
    return schema


def get_schema(schema_id: int) -> dict:
    try:
        return _registry[schema_id]
    except KeyError as exc:
        raise IWXError(ERROR_CODES['SCHEMA_NOT_FOUND'], f'Unknown IWX schema: {schema_id}') from exc


def list_schemas():
    return list(_registry.values())


def load_schema_file(path: Path, yaml_loader: Callable[[str], dict] | None = None) -> dict:
    ext = path.suffix.lower()
    text = path.read_text(encoding='utf-8')
    if ext == '.json':
        schema = json.loads(text)
    elif ext in {'.yml', '.yaml'}:
        if yaml_loader is None:
            raise IWXError(
                ERROR_CODES['SCHEMA_INVALID'],
                'YAML schema provided but no yaml_loader supplied. Pass a callable like yaml.safe_load or pre-convert to JSON.',
                {'path': str(path)},
            )
        schema = yaml_loader(text)
    else:
        raise IWXError(ERROR_CODES['SCHEMA_INVALID'], 'Unsupported schema file extension', {'path': str(path)})
    return register_schema(schema)


def load_schemas_from_dir(directory: Path | str, yaml_loader: Callable[[str], dict] | None = None) -> Iterable[dict]:
    dir_path = Path(directory)
    loaded = []
    for file_path in dir_path.iterdir():
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() not in {'.json', '.yml', '.yaml'}:
            continue
        loaded.append(load_schema_file(file_path, yaml_loader=yaml_loader))
    return loaded


_load_default_schemas()
