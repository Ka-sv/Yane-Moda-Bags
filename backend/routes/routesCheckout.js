const express = require("express");
const { MercadoPagoConfig, Payment } = require("mercadopago");
const client = new MercadoPagoConfig({
  accessToken:
    process.env.NODE_ENV !== "production"
      ? process.env.MP_ACCESS_TOKEN_SANDBOX
      : process.env.MP_ACCESS_TOKEN,
});

const Pedido = require("../models/Pedido");

const router = express.Router();

// Inicializa Mercado Pago (sandbox em dev, produção em prod)
const accessToken =
  process.env.NODE_ENV !== "production"
    ? process.env.MP_ACCESS_TOKEN_SANDBOX
    : process.env.MP_ACCESS_TOKEN;

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
    const { itens, email, firstName, lastName } = req.body;

    
    const total = itens.reduce((acc, item) => acc + Number(item.preco) * Number(item.quantidade), 0);


    const payment = new Payment(client);

    const response = await payment.create({
      body: {
        transaction_amount: total,
        description: itens.map(i => i.nome).join(", "),
        payment_method_id: "pix",
        payer: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    const pedido = new Pedido({
      itens,
      email,
      firstName,
      lastName,
      total,
      status: "pendente",        
      payment_id: response.body.id
    });

    res.json({
      message: "Pix criado com sucesso",
      orderId: pedido._id,   
      qr_code: response.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.body.point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (error) {
    console.error("Erro ao criar pagamento Pix:", error);
    res.status(500).json({ error: "Falha ao criar pagamento Pix" });
  }
});
await pedido.save();

module.exports = router;
