// routes/routesCheckout.js
const express = require("express");
const mercadopago = require("mercadopago");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Configuração Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// Criar cobrança Pix
router.post("/", async (req, res) => {
  try {
    const { itens, orderId } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    // Calcula valor total
    const amount = Number(
      itens.reduce((s, i) => s + Number(i.preco) * Number(i.quantidade || 1), 0).toFixed(2)
    );

    // Expiração do Pix (24h a partir de agora)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const paymentData = {
      transaction_amount: amount,
      description: "Compra na Yane Moda & Bags",
      payment_method_id: "pix",
      date_of_expiration: expiresAt,
      external_reference: String(orderId || Date.now()), // mapeia seu pedido interno
      notification_url: `${process.env.APP_URL}/api/mp/webhook`, // webhook que criamos
      payer: {
        email: "cliente@example.com", // depois dinamize isso
      },
    };

    const idempotencyKey = uuidv4();

    const payment = await mercadopago.payment.create(paymentData, {
      idempotencyKey,
    });

    const tx = payment.body.point_of_interaction?.transaction_data || {};

    res.json({
      orderId: payment.body.id,          // ID gerado no Mercado Pago
      amount,
      expiresAt,
      pix_qr_base64: tx.qr_code_base64,  // imagem QR em base64
      pix_copia_cola: tx.qr_code,        // código copia-e-cola
      ticket_url: tx.ticket_url || null, // instruções do MP
      status: payment.body.status,       // geralmente "pending" até o pagamento
    });

  } catch (e) {
    console.error("Erro ao criar pagamento Pix:", e?.response?.data || e.message);
    res.status(500).json({ error: "Falha ao criar pagamento Pix" });
  }
});

// Consultar status do pedido
router.get("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await mercadopago.payment.findById(id);

    let status = "pending";
    if (payment.body.status === "approved") status = "paid";
    if (
      payment.body.status === "rejected" ||
      payment.body.status === "cancelled"
    )
      status = "expired";

    res.json({
      status,
      raw: {
        status: payment.body.status,
        status_detail: payment.body.status_detail,
      },
    });
  } catch (e) {
    console.error("Erro ao consultar status:", e?.response?.data || e.message);
    res.status(500).json({ error: "Erro ao consultar status" });
  }
});

module.exports = router;
