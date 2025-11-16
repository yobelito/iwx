// Ejemplo simple de uso de IWX en el frontend (modo plain)

import { iwxEncodePlain } from "../libs/js/encoder.js";

const sale = {
  tenant: "t-001",
  sale_date: "2025-01-01",
  amount: 199.9,
};

const payload = iwxEncodePlain(1, sale);
console.log("Payload IWX:", JSON.stringify(payload));
