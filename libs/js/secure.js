// IWX Secure helpers using Web Crypto API (AES-256-GCM)
import { iwxEncodePlain, iwxDecode } from './encoder.js';
import { ERROR_CODES, IwxError } from './errors.js';

const subtle = globalThis.crypto?.subtle || globalThis.crypto?.webcrypto?.subtle;

function toBase64(bytes) {
  if (typeof btoa === 'function') {
    return btoa(String.fromCharCode(...bytes));
  }
  return Buffer.from(bytes).toString('base64');
}

function fromBase64(b64) {
  if (typeof atob === 'function') {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  }
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

async function importKeyFromBase64(keyB64) {
  if (!subtle) throw new IwxError(ERROR_CODES.SCHEMA_INVALID, 'WebCrypto subtle API unavailable');
  const raw = fromBase64(keyB64);
  return subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function iwxSecureEncryptValues(values, keyB64) {
  const key = await importKeyFromBase64(keyB64);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(values));
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(ciphertext)) };
}

export async function iwxSecureDecryptValues(ivB64, dataB64, keyB64) {
  try {
    const key = await importKeyFromBase64(keyB64);
    const iv = fromBase64(ivB64);
    const raw = fromBase64(dataB64);
    const plaintext = await subtle.decrypt({ name: 'AES-GCM', iv }, key, raw);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch (err) {
    throw new IwxError(ERROR_CODES.DECRYPTION_FAILED, 'Unable to decrypt IWX payload', { cause: err });
  }
}

export async function iwxSecureEncode(schemaId, sourceObject, { keyId, keyBase64, algorithm = 'AES-256-GCM', source = 'frontend' } = {}) {
  const plain = iwxEncodePlain(schemaId, sourceObject, { source });
  const encrypted = await iwxSecureEncryptValues(plain._v, keyBase64);
  return { _s: schemaId, _k: keyId, _a: algorithm, _iv: encrypted.iv, _v: encrypted.data };
}

export async function iwxSecureDecode(payload, keyBase64, { target = 'frontend' } = {}) {
  const values = await iwxSecureDecryptValues(payload._iv, payload._v, keyBase64);
  return iwxDecode({ _s: payload._s, _v: values }, { target });
}
