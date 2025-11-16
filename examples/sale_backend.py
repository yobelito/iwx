# Ejemplo simple de uso de IWX en el backend (modo plain)

from libs.python.decoder import iwx_decode_to_backend

payload = {
    "_s": 1,
    "_v": ["t-001", "2025-01-01", 199.9],
}

obj = iwx_decode_to_backend(payload)
print("Objeto backend:", obj)
