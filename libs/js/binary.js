// IWX-BIN encoder/decoder (v1 framing)
import { ERROR_CODES, IwxError } from './errors.js';

const MAGIC = new Uint8Array([0x49, 0x57, 0x58]); // 'IWX'
const VERSION = 0x01;

function encodeHeader(schemaId, valueCount, payloadBytes) {
  const buffer = new ArrayBuffer(12);
  const view = new DataView(buffer);
  MAGIC.forEach((b, i) => view.setUint8(i, b));
  view.setUint8(3, VERSION);
  view.setUint16(4, schemaId, false);
  view.setUint16(6, valueCount, false);
  view.setUint32(8, payloadBytes.length, false);
  return new Uint8Array(buffer);
}

export function iwxBinEncode(payload) {
  const values = payload._v || [];
  const body = new TextEncoder().encode(JSON.stringify(values));
  const header = encodeHeader(payload._s, values.length, body);
  const out = new Uint8Array(header.length + body.length);
  out.set(header, 0);
  out.set(body, header.length);
  return out;
}

export function iwxBinDecode(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.length < 12) throw new IwxError(ERROR_CODES.BINARY_FORMAT, 'IWX-BIN frame too small');
  if (bytes[0] !== MAGIC[0] || bytes[1] !== MAGIC[1] || bytes[2] !== MAGIC[2]) {
    throw new IwxError(ERROR_CODES.BINARY_FORMAT, 'Invalid IWX-BIN magic');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint8(3);
  if (version !== VERSION) throw new IwxError(ERROR_CODES.BINARY_FORMAT, 'Unsupported IWX-BIN version');
  const schemaId = view.getUint16(4, false);
  const count = view.getUint16(6, false);
  const len = view.getUint32(8, false);
  if (bytes.length < 12 + len) throw new IwxError(ERROR_CODES.BINARY_FORMAT, 'IWX-BIN length mismatch');
  const body = new Uint8Array(bytes.buffer, bytes.byteOffset + 12, len);
  const values = JSON.parse(new TextDecoder().decode(body));
  if (Array.isArray(values) && values.length !== count) {
    // not fatal, but surface a hint
    throw new IwxError(ERROR_CODES.BINARY_FORMAT, 'IWX-BIN value count mismatch', { expected: count, got: values.length });
  }
  return { _s: schemaId, _v: values };
}
