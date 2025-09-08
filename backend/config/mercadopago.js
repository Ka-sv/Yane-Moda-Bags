const { MercadoPagoConfig } = require("mercadopago");

const mpClient = new MercadoPagoConfig({
  access_token: process.env.MP_ACCESS_TOKEN,
  integrator_id: process.env.MP_INTEGRATOR_ID || undefined,
});

module.exports = mpClient;
