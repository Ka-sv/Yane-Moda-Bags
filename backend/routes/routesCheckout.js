import express from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import Pedido from "../models/Pedido.js";

const router = express.Router();

// ------------------- Rota de checkout Pix -------------------
router.post("/pix", async (req, res) => {
  try {
    const { email, firstName, lastName, itens } = req.body;
    if (!email || !firstName || !lastName || !itens?.length) {
      return res.status(400).json({ error: "Dados de checkout inválidos" });
    }

    const transaction_amount = Number(itens.reduce(
      (total, item) => total + (Number(item.preco) || 0) * (Number(item.quantidade) || 0),
      0
    ).toFixed(2));

    const paymentData = {
      transaction_amount,
      description: "Compra Yane Moda & Bags",
      payment_method_id: "pix",
      payer: { email, first_name: firstName, last_name: lastName }
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": uuidv4(),
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    // 👉 Salva o pedido no Mongo
    const novoPedido = new Pedido({
      itens,
      email,
      firstName,
      lastName,
      total: transaction_amount,
      status: "pending",
      payment_id: data.id
    });
    await novoPedido.save();

    res.json({
      id: data.id,
      status: data.status,
      transaction_amount,
      pix_qr_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code || null,
    });
  } catch (error) {
    console.error("❌ Erro ao finalizar compra:", error);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});

// ------------------- Rota de status -------------------
router.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    // 👉 Atualiza pedido no banco
    await Pedido.findOneAndUpdate(
      { payment_id: id },
      { status: data.status },
      { new: true }
    );

    res.json({ status: data.status });
  } catch (error) {
    console.error("❌ Erro ao buscar status do pagamento:", error);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});

export default router;
