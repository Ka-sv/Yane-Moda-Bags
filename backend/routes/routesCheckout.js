const express = require("express");
const { v4: uuidv4 } = require("uuid");
const MercadoPago = require("mercadopago");
const Pedido = require("../models/Pedido");

const router = express.Router();

// Inicializa Mercado Pago com token correto
const mp = new MercadoPago(
  process.env.NODE_ENV !== "production"
    ? process.env.MP_ACCESS_TOKEN_SANDBOX
    : process.env.MP_ACCESS_TOKEN
);

// ----------------- Função auxiliar -----------------
function validarItens(itens) {
  if (!itens || !Array.isArray(itens) || itens.length === 0) return false;
  for (const item of itens) {
    if (!item.nome || !item.preco || isNaN(item.preco) || item.preco <= 0) return false;
    if (item.quantidade && (isNaN(item.quantidade) || item.quantidade <= 0)) return false;
  }
  return true;
}

// ----------------- POST /api/checkout -----------------
router.post("/", async (req, res) => {
  try {
    // 🔹 Log do body do front-end
    console.log("📥 Body recebido do front-end:", req.body);

    const { itens, orderId, email, firstName, lastName } = req.body;

    // Valida campos
    if (!validarItens(itens)) return res.status(400).json({ error: "Itens inválidos" });
    if (!email || typeof email !== "string") return res.status(400).json({ error: "Email inválido" });
    if (!firstName || !lastName) return res.status(400).json({ error: "Nome ou sobrenome inválido" });

    // Calcula valor total
    const amount = Number(
      itens.reduce((total, item) => total + Number(item.preco) * Number(item.quantidade || 1), 0).toFixed(2)
    );

    if (amount <= 0) return res.status(400).json({ error: "Valor total inválido" });

    // Referência externa do pedido
    const externalRef = String(orderId || Date.now());
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    // Dados do pagamento Pix
    const paymentData = {
      transaction_amount: amount,
      description: "Compra na Yane Moda & Bags",
      payment_method_id: "pix",
      date_of_expiration: expiresAt,
      external_reference: externalRef,
      notification_url: `${process.env.APP_URL}/api/mp/webhook`,
      payer: { email },
    };

    // 🔹 Log do pagamento
    console.log("💳 Dados enviados ao Mercado Pago:", paymentData);

    // Verifica dados básicos antes de enviar
    if (!paymentData.transaction_amount || !paymentData.payer.email || !paymentData.payment_method_id) {
      console.error("❌ paymentData inválido:", paymentData);
      return res.status(400).json({ error: "Dados de pagamento incompletos" });
    }

    // Cria pagamento
    const result = await mp.payment.create(paymentData);
    const data = result.body;
    const tx = data.point_of_interaction?.transaction_data || {};

    // Salva pedido no banco
    const novoPedido = new Pedido({
      orderId: externalRef,
      itens,
      email,
      firstName,
      lastName,
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

    if (e.response) {
      console.error("🔹 Resposta do Mercado Pago:", e.response.body);
    }

    res.status(500).json({
      error: "Falha ao criar pagamento Pix",
      detalhes: e.response?.body || e.cause || e.message || e
    });
  }
});

module.exports = router;
