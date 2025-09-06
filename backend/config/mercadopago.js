import MercadoPago from 'mercadopago';

const mp = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN, // coloque seu token no .env
  integrator_id: 'YOUR_INTEGRATOR_ID',       // opcional
});

export default mp;
