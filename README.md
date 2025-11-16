# IWX — Index Wire eXchange Protocol  
**Versión: 1.0.0 (Draft Estable)**  
**Licencia: Apache 2.0**

IWX es un protocolo de transporte compacto, seguro y basado en esquemas, diseñado para reemplazar cargas JSON verbosas por estructuras indexadas extremadamente ligeras, fáciles de validar y aptas para comunicación cliente-servidor, microservicios, edge computing y aplicaciones de alto rendimiento.

---

## 🔥 Características principales

- **Representación compacta**  
  Basado en índices (`pos`) en lugar de nombres de campos.

- **Separación de frontend / backend**  
  Frontend usa alias propios; backend usa nombres internos. Ambos mapeados por esquema.

- **Seguro por diseño**  
  Perfil opcional **IWX-Secure** con AES-256-GCM sobre `_v`.

- **Extensible**  
  Versionado por esquema (`schema_id`), nuevos perfiles (JSON, BIN).

- **Futuro post-cuántico**  
  La arquitectura admite algoritmos alternativos en `_a` para cifrado avanzado futuro.

- **Compatible con REST**  
  No reemplaza HTTP/HTTPS, sino que define un *wire format* portable.

---

## 📦 Instalación / Integración

### JavaScript / Browser / Node
```bash
# próximamente vía npm
npm install iwx-protocol
```

### Python
```bash
# próximamente vía pip
pip install iwx
```

### PHP
```bash
# vía composer (planeado)
composer require iwx-protocol/iwx
```

*(Las librerías incluidas en este repo sirven como base para la implementación.)*

---

## 📚 Tabla de Contenidos

1. [Introducción](#-introducción)  
2. [Estructura del Payload IWX](#-estructura-del-payload-iwx)  
3. [Ejemplos de Uso](#-ejemplos-de-uso)  
4. [Perfiles de Transporte](#-perfiles-de-transporte)  
5. [IWX-Secure](#-iwx-secure)  
6. [Esquemas](#-esquemas)  
7. [Implementaciones por Lenguaje](#-implementaciones-por-lenguaje)  
8. [Roadmap](#-roadmap)  
9. [Contribuir](#-contribuir)  
10. [Licencia](#-licencia)

---

## 🧠 Introducción

Los formatos modernos como JSON son fáciles de usar, pero repetitivos:

```json
{
  "tenant_id": "t-001",
  "date": "2025-01-01",
  "total": 199.9
}
```

En un sistema de miles de requests por segundo:

- Los nombres de campos ocupan más que los valores.
- El backend queda expuesto (nombres internos).
- Todo depende únicamente de TLS para la confidencialidad.

**IWX resuelve esto:**

```json
{
  "_s": 1,
  "_v": ["t-001", "2025-01-01", 199.9]
}
```

Con un esquema predefinido:

```json
{
  "schema_id": 1,
  "fields": [
    { "pos": 0, "frontend": "tenant", "backend": "tenant_id", "type": "string" },
    { "pos": 1, "frontend": "sale_date", "backend": "date", "type": "date" },
    { "pos": 2, "frontend": "amount", "backend": "total", "type": "number" }
  ]
}
```

---

## 🧩 Estructura del Payload IWX

Payload JSON básico:

```json
{
  "_s": <schema_id>,
  "_v": [ <valores_por_posición> ]
}
```

- `_s`: Identificador del esquema  
- `_v`: Array con valores según `pos`

---

## 🧪 Ejemplos de Uso

### Frontend → Backend (JS)

```js
import { iwxEncodePlain } from "./libs/js/encoder.js";

const sale = {
  tenant: "t-001",
  sale_date: "2025-01-01",
  amount: 199.9
};

const payload = iwxEncodePlain(1, sale);

console.log(payload);
// { _s: 1, _v: ["t-001", "2025-01-01", 199.9] }
```

### Backend (Python)

```python
from libs.python.decoder import iwx_decode_to_backend

payload = {
    "_s": 1,
    "_v": ["t-001", "2025-01-01", 199.9]
}

obj = iwx_decode_to_backend(payload)
print(obj)

# {'tenant_id': 't-001', 'date': '2025-01-01', 'total': 199.9}
```

---

## 🔐 IWX-Secure

Perfil cifrado sobre `_v` usando AES-256-GCM:

```json
{
  "_s": 1,
  "_k": "iwx-ks-123",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext)"
}
```

El handshake:

```http
POST /iwx/handshake
→ { "key_id": "iwx-ks-123", "alg": "AES-256-GCM", "key": "BASE64(32_bytes)" }
```

El cliente cifra los valores.  
El servidor descifra con la clave de sesión.

---

## 🚚 Perfiles de Transporte

IWX define 2 perfiles principales:

### 1. **IWX-JSON**  
`Content-Type: application/vnd.iwx+json`

Legible, ideal para APIs externas.

### 2. **IWX-BIN**  
`Content-Type: application/vnd.iwx+bin`

Frame binario súper compacto:

```text
[MAGIC][VER][SCHEMA][COUNT][VALUES...]
```

---

## 📐 Esquemas

Definidos en:

```text
schemas/<modelo>/schema.json
```

Cada campo define:

- `pos`
- `frontend`
- `backend`
- `type`
- `required`

Ver `specs/SCHEMA-SPEC.md` para el contrato completo.

---

## 💻 Implementaciones por Lenguaje

Incluidas en la carpeta `libs/`:

- `libs/js/`  
- `libs/python/`  
- `libs/php/`  

Cada una incluye:

- `encoder` (frontend → IWX)  
- `decoder` (IWX → backend)  
- `secure` (cifrado / descifrado)

---

## 🗺 Roadmap

### ✔ v1.0 (incluido)

- Perfil JSON  
- Perfil Secure  
- Perfil BIN (inicial)  
- Esquema base  
- Librerías iniciales  
- Whitepaper v1.0  

### 🔄 v1.1 (próximo)

- IWX-BIN completo  
- CLI `iwx-inspect`  
- Generador automático de esquemas  

### 🔮 Futuro

- Soporte de algoritmos post-cuánticos  
- Integración con WebAssembly  
- SDK oficial multi-lenguaje  
- Registro público de esquemas (IWX Hub)  

---

## 🤝 Contribuir

Las contribuciones son bienvenidas.  
Puedes:

- Abrir issues  
- Proponer mejoras al protocolo  
- Crear implementaciones en otros lenguajes  
- Expandir el perfil seguro  

---

## 📄 Licencia

**Apache License 2.0** (incluida en este repositorio).  
Permite uso comercial, modificación, distribución e integración con software cerrado o abierto.

---
