const { MercadoPagoConfig } = require("mercadopago");

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.NODE_ENV !== "production"
    ? process.env.MP_ACCESS_TOKEN_SANDBOX
    : process.env.MP_ACCESS_TOKEN,
});

module.exports = mpClient;
