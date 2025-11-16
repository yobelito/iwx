// IWX Secure helpers (cliente)
// Ejemplo simplificado usando Web Crypto API (navegador moderno).

/**
 * Importa una clave simétrica desde Base64.
 */
async function importKeyFromBase64(keyB64) {
  const raw = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra un array de valores IWX con AES-256-GCM.
 * @param {any[]} values
 * @param {string} keyB64 - clave en Base64
 * @returns {Promise<{iv:string, data:string}>}
 */
export async function iwxSecureEncryptValues(values, keyB64) {
  const key = await importKeyFromBase64(keyB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(values));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  const ivB64 = btoa(String.fromCharCode(...iv));
  const dataB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

  return { iv: ivB64, data: dataB64 };
}
