import mongoose from "mongoose";

const PedidoSchema = new mongoose.Schema({
  itens: [
    {
      nome: { type: String, required: true },
      preco: { type: Number, required: true },
      quantidade: { type: Number, default: 1 },
    },
  ],
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },
  payment_id: { type: String },
}, { timestamps: true }); // createdAt e updatedAt automáticos


export default mongoose.models.Pedido || mongoose.model("Pedido", PedidoSchema);

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // ou axios, dependendo do seu setup

// Rota de teste Pix
router.post("/teste-pix", async (req, res) => {
  try {
    const testePaymentData = {
      transaction_amount: 1.0,
      description: "Teste Pix Produção",
      payment_method_id: "pix",
      payer: {
        email: "artemadeiradong@gmail.com",
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer APP_USR-xxxxxxxxxxxxxxxxxxxx", // seu token de produção
      },
      body: JSON.stringify(testePaymentData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erro no teste Pix:", error);
    res.status(500).json({ error: "Erro ao processar teste Pix" });
  }
});

// Rota de checkout Pix real
router.post("/checkout/pix", async (req, res) => {
  try {
    const { email, firstName, lastName, itens } = req.body;

    const paymentData = {
      transaction_amount: itens.reduce((total, item) => total + item.price, 0),
      description: "Compra Yane Moda & Bags",
      payment_method_id: "pix",
      payer: { email },
      additional_info: {
        items: itens,
        payer: { first_name: firstName, last_name: lastName },
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`

      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});

module.exports = router;
