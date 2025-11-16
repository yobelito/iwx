# Ejemplo conceptual de descifrado IWX-Secure en el backend.

from base64 import b64decode
from libs.python.secure import iwx_secure_decrypt_values
from libs.python.decoder import iwx_decode_to_backend

# Ejemplo: payload recibido (valores ficticios)
payload = {
    "_s": 1,
    "_k": "iwx-ks-demo",
    "_a": "AES-256-GCM",
    "_iv": "<IV_BASE64>",
    "_v": "<DATA_BASE64>",
}

key_bytes = b"0" * 32  # clave de ejemplo; en producción viene del registro de claves

values = iwx_secure_decrypt_values(payload["_iv"], payload["_v"], key_bytes)
plain_payload = {"_s": payload["_s"], "_v": values}
obj_backend = iwx_decode_to_backend(plain_payload)
print("Objeto backend:", obj_backend)
