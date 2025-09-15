const express = require("express");
const router = express.Router();
const { processarEvento } = require("../controllers/pagamentoController");

// Recebe notificações do Mercado Pago
router.post("/mercadopago", async (req, res) => {
  const event = req.body;
  const signature = req.headers['x-mercadopago-signature'];

  // 🔹 Validação da assinatura (opcional, mas recomendada em produção)
  if (process.env.MP_WEBHOOK_SECRET && signature !== process.env.MP_WEBHOOK_SECRET) {
    console.warn("⚠️ Webhook inválido ou assinatura incorreta", { signature });
    return res.status(403).send("Forbidden");
  }

  try {
    console.log("📥 Evento recebido do Mercado Pago:", event);

    // 🔹 Processa o evento
    await processarEvento(event);

    // 🔹 Confirma recebimento
    console.log("✅ Evento processado com sucesso:", event.type);
    res.status(200).send("OK");

  } catch (err) {
    console.error("❌ Erro ao processar webhook:", err);

    // 🔹 Retorna erro interno
    res.status(500).send("Erro interno");
  }
});

module.exports = router;
