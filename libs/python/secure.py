import json
from base64 import b64encode, b64decode
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes


def iwx_secure_encrypt_values(values, key_bytes: bytes):
    """Cifra un array de valores usando AES-256-GCM.

    values: lista de valores IWX
    key_bytes: clave simétrica (32 bytes)
    """
    plaintext = json.dumps(values).encode("utf-8")
    iv = get_random_bytes(12)
    cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=iv)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    data = ciphertext + tag
    return {
        "iv": b64encode(iv).decode("ascii"),
        "data": b64encode(data).decode("ascii"),
    }


def iwx_secure_decrypt_values(iv_b64: str, data_b64: str, key_bytes: bytes):
    raw_iv = b64decode(iv_b64)
    raw_data = b64decode(data_b64)
    ciphertext = raw_data[:-16]
    tag = raw_data[-16:]
    cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=raw_iv)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return json.loads(plaintext.decode("utf-8"))
