const express = require("express");
const router = express.Router();
const { processarEvento } = require("../controllers/pagamentoController");

// Recebe notificações do Mercado Pago
router.post("/mercadopago", async (req, res) => {
  const event = req.body;
  const signature = req.headers['x-mercadopago-signature'];

  // Validação opcional da assinatura
  if (process.env.MP_WEBHOOK_SECRET && signature !== process.env.MP_WEBHOOK_SECRET) {
    console.warn("Webhook inválido ou assinatura incorreta");
    return res.status(403).send("Forbidden");
  }

  try {
    await processarEvento(event);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Erro ao processar webhook:", err);
    res.status(500).send("Erro interno");
  }
});

module.exports = router;
