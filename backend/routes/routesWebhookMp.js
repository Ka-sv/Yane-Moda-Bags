const express = require("express");
const { v4: uuidv4 } = require("uuid");
const mercadopago = require("mercadopago");
const Pedido = require("../models/Pedido"); // novo modelo de pedidos

const router = express.Router();

// Configura ambiente (sandbox em dev, produção em prod)
mercadopago.configurations.setAccessToken(
  process.env.NODE_ENV !== "production"
    ? process.env.MP_ACCESS_TOKEN_SANDBOX
    : process.env.MP_ACCESS_TOKEN
);

// Função auxiliar para validar itens
function validarItens(itens) {
  if (!itens || !Array.isArray(itens) || itens.length === 0) return false;
  for (const item of itens) {
    if (!item.nome || !item.preco || isNaN(item.preco) || item.preco <= 0) return false;
    if (item.quantidade && (isNaN(item.quantidade) || item.quantidade <= 0)) return false;
  }
  return true;
}

router.post("/", async (req, res) => {
  try {
    const { itens, orderId, email } = req.body;

    // Validação básica
    if (!validarItens(itens)) {
      return res.status(400).json({ error: "Itens inválidos" });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Calcula valor total
    const amount = Number(
      itens.reduce(
        (total, item) => total + Number(item.preco) * Number(item.quantidade || 1),
        0
      ).toFixed(2)
    );

    if (amount <= 0) {
      return res.status(400).json({ error: "Valor total inválido" });
    }

    // Cria referência externa para vincular ao pedido
    const externalRef = String(orderId || Date.now());
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Prepara dados do pagamento Pix
    const paymentData = {
      transaction_amount: amount,
      description: "Compra na Yane Moda & Bags",
      payment_method_id: "pix",
      date_of_expiration: expiresAt,
      external_reference: externalRef,
      notification_url: `${process.env.APP_URL}/api/mp/webhook`,
      payer: { email },
    };

    console.log("paymentData enviado:", paymentData);

    // Cria pagamento no Mercado Pago
    const result = await mercadopago.payment.create(paymentData);

    const data = result.body;
    const tx = data.point_of_interaction?.transaction_data || {};

    // 👉 Cria pedido no banco
    const novoPedido = new Pedido({
      orderId: externalRef,
      itens,
      email,
      status: data.status || "pending",
      paymentId: data.id,
    });
    await novoPedido.save();

    // Resposta para o front-end
    res.json({
      orderId: data.id,
      amount,
      expiresAt,
      pix_qr_base64: tx.qr_code_base64 || null,
      pix_copia_cola: tx.qr_code || null,
      ticket_url: tx.ticket_url || null,
      status: data.status,
    });

  } catch (e) {
    console.error("❌ Erro ao criar pagamento Pix:", e);

    res.status(500).json({
      error: "Falha ao criar pagamento Pix",
      detalhes: e.cause || e.message || e
    });
  }
});

module.exports = router;
