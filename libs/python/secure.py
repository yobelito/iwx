import json
from base64 import b64encode, b64decode
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

from .encoder import iwx_encode_plain
from .decoder import iwx_decode_to_backend, iwx_decode_to_front
from .errors import ERROR_CODES, IWXError


def iwx_secure_encrypt_values(values, key_bytes: bytes):
    """Encrypt an array of values using AES-256-GCM."""
    plaintext = json.dumps(values, separators=(',', ':')).encode('utf-8')
    iv = get_random_bytes(12)
    cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=iv)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    data = ciphertext + tag
    return {
        'iv': b64encode(iv).decode('ascii'),
        'data': b64encode(data).decode('ascii'),
    }


def iwx_secure_decrypt_values(iv_b64: str, data_b64: str, key_bytes: bytes):
    try:
        raw_iv = b64decode(iv_b64)
        raw_data = b64decode(data_b64)
        ciphertext, tag = raw_data[:-16], raw_data[-16:]
        cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=raw_iv)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        return json.loads(plaintext.decode('utf-8'))
    except Exception as exc:  # noqa: BLE001
        raise IWXError(ERROR_CODES['DECRYPTION_FAILED'], 'Unable to decrypt IWX payload') from exc


def wrap_secure(schema_id: int, obj: dict, key_bytes: bytes, key_id: str, *, source: str = 'frontend', algorithm: str = 'AES-256-GCM') -> dict:
    plain = iwx_encode_plain(schema_id, obj, source=source)
    encrypted = iwx_secure_encrypt_values(plain['_v'], key_bytes)
    return {'_s': schema_id, '_k': key_id, '_a': algorithm, '_iv': encrypted['iv'], '_v': encrypted['data']}


def unwrap_secure(payload: dict, key_bytes: bytes, *, target: str = 'frontend') -> dict:
    values = iwx_secure_decrypt_values(payload['_iv'], payload['_v'], key_bytes)
    if target == 'backend':
        return iwx_decode_to_backend({'_s': payload['_s'], '_v': values})
    return iwx_decode_to_front({'_s': payload['_s'], '_v': values})
