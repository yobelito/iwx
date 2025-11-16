// Ejemplo conceptual de cifrado IWX-Secure en el frontend.

import { iwxEncodePlain } from "../libs/js/encoder.js";
import { iwxSecureEncryptValues } from "../libs/js/secure.js";

async function demoSecure(keyB64) {
  const sale = {
    tenant: "t-001",
    sale_date: "2025-01-01",
    amount: 199.9,
  };

  const plainPayload = iwxEncodePlain(1, sale);
  const values = plainPayload._v;

  const { iv, data } = await iwxSecureEncryptValues(values, keyB64);

  const securePayload = {
    _s: 1,
    _k: "iwx-ks-demo",
    _a: "AES-256-GCM",
    _iv: iv,
    _v: data,
  };

  console.log("Payload IWX-Secure:", JSON.stringify(securePayload));
}
