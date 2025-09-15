const express = require("express");
const MercadoPago = require("mercadopago");
const Pedido = require("../models/Pedido");

const router = express.Router();

// Inicializa Mercado Pago
MercadoPago.configurations.setAccessToken(
  process.env.NODE_ENV !== "production"
    ? process.env.MP_ACCESS_TOKEN_SANDBOX
    : process.env.MP_ACCESS_TOKEN
);

// Função para validar itens
function validarItens(itens) {
  if (!itens || !Array.isArray(itens) || itens.length === 0) return false;
  for (const item of itens) {
    if (!item.nome || !item.preco || isNaN(item.preco) || item.preco <= 0) return false;
    if (item.quantidade && (isNaN(item.quantidade) || item.quantidade <= 0)) return false;
  }
  return true;
}

// Criar pagamento Pix
router.post("/", async (req, res) => {
  try {
    const { itens, orderId, email } = req.body;

    if (!validarItens(itens)) return res.status(400).json({ error: "Itens inválidos" });
    if (!email) return res.status(400).json({ error: "Email inválido" });

    // Calcula valor total
    const amount = Number(
      itens.reduce((total, i) => total + Number(i.preco) * Number(i.quantidade || 1), 0).toFixed(2)
    );

    const externalRef = String(orderId || Date.now());
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Cria paymentData
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
    const result = await MercadoPago.payment.create(paymentData);
    const data = result.body;

    console.log("Resposta do Mercado Pago:", data);

    // Salva no banco
    const novoPedido = new Pedido({
      orderId: externalRef,
      itens,
      email,
      status: data.status || "pending",
      paymentId: data.id,
    });
    await novoPedido.save();

    res.json({
      orderId: data.id,
      amount,
      expiresAt,
      pix_qr_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code || null,
      ticket_url: data.point_of_interaction?.transaction_data?.ticket_url || null,
      status: data.status,
    });

  } catch (e) {
    console.error("❌ Erro ao criar pagamento Pix:", e);
    if (e.response) console.error("Detalhes da resposta do Mercado Pago:", e.response);

    res.status(500).json({
      error: "Falha ao criar pagamento Pix",
      detalhes: e.cause || e.message || e,
    });
  }
});

module.exports = router;
