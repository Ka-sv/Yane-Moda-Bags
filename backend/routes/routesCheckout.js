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
    const { itens, orderId, email, firstName, lastName } = req.body;

    if (!validarItens(itens)) return res.status(400).json({ error: "Itens inválidos" });
    if (!email) return res.status(400).json({ error: "Email inválido" });

    // Valor total
    const amount = Number(
      itens.reduce((total, item) => total + Number(item.preco) * Number(item.quantidade || 1), 0).toFixed(2)
    );
    if (amount <= 0) return res.status(400).json({ error: "Valor total inválido" });

    const externalRef = String(orderId || Date.now());
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const paymentData = {
      transaction_amount: amount,
      description: "Compra na Yane Moda & Bags",
      payment_method_id: "pix",
      date_of_expiration: expiresAt,
      external_reference: externalRef,
      notification_url: `${process.env.APP_URL}/api/mp/webhook`,
      payer: { email, first_name: firstName || "Cliente", last_name: lastName || "Loja" },
      additional_info: {
        items: itens.map((item, index) => ({
          id: String(index + 1),
          title: item.nome,
          description: item.descricao || "Produto",
          category_id: item.categoria || "others",
          quantity: Number(item.quantidade || 1),
          unit_price: Number(item.preco)
        }))
      }
    };

    console.log("paymentData enviado:", paymentData);

    // Cria pagamento
    const result = await mp.payment.create(paymentData);
    const data = result.body;
    const tx = data.point_of_interaction?.transaction_data || {};

    // Salva pedido no banco
    const novoPedido = new Pedido({
      orderId: externalRef,
      itens,
      email,
      status: data.status || "pending",
      paymentId: data.id
    });
    await novoPedido.save();

    res.json({
      orderId: data.id,
      amount,
      expiresAt,
      pix_qr_base64: tx.qr_code_base64 || null,
      pix_copia_cola: tx.qr_code || null,
      ticket_url: tx.ticket_url || null,
      status: data.status
    });

  } catch (e) {
    console.error("❌ Erro ao criar pagamento Pix:", e);
    res.status(500).json({ error: "Falha ao criar pagamento Pix", detalhes: e.cause || e.message || e });
  }
});

module.exports = router;
