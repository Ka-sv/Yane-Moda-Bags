const express = require("express");
const router = express.Router();
const { processarEvento } = require("../controllers/pagamentoController");

// Recebe notificações do Mercado Pago
router.post("/mercadopago", (req, res) => {
  const event = req.body;

  // Aqui você poderia validar a assinatura usando a secret
  // Exemplo simplificado: se quiser validar, use MP_WEBHOOK_SECRET

  processarEvento(event);

  res.status(200).send("OK"); // confirma recebimento
});

module.exports = router;
