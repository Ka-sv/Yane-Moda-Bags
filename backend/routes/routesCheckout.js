const express = require("express");
const mercadopago = require("mercadopago");
const Pedido = require("../models/Pedido");

const router = express.Router();

// Inicializa Mercado Pago (sandbox em dev, produção em prod)
const accessToken =
  process.env.NODE_ENV !== "production"
    ? process.env.MP_ACCESS_TOKEN_SANDBOX
    : process.env.MP_ACCESS_TOKEN;

mercadopago.configurations.setAccessToken(accessToken);

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

// ----------------- ROTA PIX PRODUÇÃO -----------------
router.post("/pix", async (req, res) => {
  try {
    const { itens, email } = req.body;

    // Valida itens
    if (!validarItens(itens)) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    // Calcula valor total do pedido
    const transaction_amount = itens.reduce(
      (total, item) => total + Number(item.preco) * (Number(item.quantidade) || 1),
      0
    );

    // Cria pagamento PIX
    const pagamentoData = {
      transaction_amount,
      description: "Pedido Loja Online",
      payment_method_id: "pix",
      payer: { email },
    };

    const result = await mercadopago.payment.create(pagamentoData);

    // Salva pedido no banco
    const pedido = new Pedido({
      itens,
      email,
      status: "pendente",
      payment_id: result.body.id,
    });

    await pedido.save();

    // Retorna QR Code para front-end
    res.json({
      message: "Pix criado com sucesso ✅",
      id: result.body.id,
      qr_code: result.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: result.body.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (e) {
    console.error("❌ Erro ao criar Pix:", e.response?.body || e);
    res.status(500).json({
      error: "Falha ao criar Pix",
      detalhes: e.response?.body || e.message,
    });
  }
});

module.exports = router;
