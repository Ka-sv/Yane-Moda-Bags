const express = require("express");
const mercadopago = require("mercadopago");
const Pedido = require("../models/Pedido");

const router = express.Router();

// Inicializa Mercado Pago (sandbox em dev, produção em prod)
mercadopago.configure({
  access_token:
    process.env.NODE_ENV !== "production"
      ? process.env.MP_ACCESS_TOKEN_SANDBOX
      : process.env.MP_ACCESS_TOKEN,
});

// ----------------- Função auxiliar -----------------
function validarItens(itens) {
  if (!itens || !Array.isArray(itens) || itens.length === 0) return false;
  for (const item of itens) {
    const preco = Number(item.preco);
    const quantidade = Number(item.quantidade || 1);
    if (!item.nome || isNaN(preco) || preco <= 0) return false;
    if (isNaN(quantidade) || quantidade <= 0) return false;
  }
  return true;
}

// ----------------- ROTA DE TESTE PIX -----------------
router.post("/teste-pix", async (req, res) => {
  try {
    const testePaymentData = {
      transaction_amount: 1.0,
      description: "Teste Pix Produção",
      payment_method_id: "pix",
      payer: { email: "artemadeiradong@gmail.com" },
    };

    const result = await mercadopago.payment.create(testePaymentData);
    console.log("✅ Pix de teste criado:", result.body);

    res.json({
      message: "Pix de teste criado com sucesso ✅",
      dados: result.body,
    });
  } catch (e) {
    console.error("❌ Erro Pix de teste:", e.response?.body || e);
    res.status(500).json({
      error: "Falha ao criar Pix de teste",
      detalhes: e.response?.body || e.message,
    });
  }
});

module.exports = router;
