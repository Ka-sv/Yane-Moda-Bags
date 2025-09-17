// config/mpClient.js
import { MercadoPagoConfig } from "mercadopago";

const mpClient = new MercadoPagoConfig({
  accessToken:
    process.env.NODE_ENV !== "production"
      ? process.env.MP_ACCESS_TOKEN_SANDBOX
      : process.env.MP_ACCESS_TOKEN,
});

export default mpClient; // ✅ export default para ES Modules
