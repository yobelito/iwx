import json
import struct
from .errors import ERROR_CODES, IWXError

MAGIC = b'IWX'
VERSION = 0x01
HEADER_FMT = '>3sBHHI'  # magic, version, schema_id, count, length
HEADER_LEN = struct.calcsize(HEADER_FMT)


def iwx_bin_encode(payload: dict) -> bytes:
    values = payload.get('_v', [])
    body = json.dumps(values, separators=(',', ':')).encode('utf-8')
    header = struct.pack(HEADER_FMT, MAGIC, VERSION, payload['_s'], len(values), len(body))
    return header + body


def iwx_bin_decode(raw: bytes) -> dict:
    if len(raw) < HEADER_LEN:
        raise IWXError(ERROR_CODES['BINARY_FORMAT'], 'IWX-BIN frame too small')
    magic, version, schema_id, count, length = struct.unpack(HEADER_FMT, raw[:HEADER_LEN])
    if magic != MAGIC:
        raise IWXError(ERROR_CODES['BINARY_FORMAT'], 'Invalid IWX-BIN magic')
    if version != VERSION:
        raise IWXError(ERROR_CODES['BINARY_FORMAT'], 'Unsupported IWX-BIN version')
    if len(raw) < HEADER_LEN + length:
        raise IWXError(ERROR_CODES['BINARY_FORMAT'], 'IWX-BIN length mismatch')
    values = json.loads(raw[HEADER_LEN:HEADER_LEN + length].decode('utf-8'))
    if isinstance(values, list) and len(values) != count:
        raise IWXError(ERROR_CODES['BINARY_FORMAT'], 'IWX-BIN value count mismatch', {'expected': count, 'got': len(values)})
    return {'_s': schema_id, '_v': values}
