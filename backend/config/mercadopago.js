
import { MercadoPagoConfig } from "mercadopago";


const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, 
  integratorId: process.env.MP_INTEGRATOR_ID || undefined, 
});

export default mpClient;
