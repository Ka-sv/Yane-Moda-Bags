// api/pix.js
import { Payment } from "mercadopago";
import mpClient from "../config/mpClient";
import Pedido from "../models/Pedido";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { itens, email } = req.body;
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    const transaction_amount = itens.reduce(
      (total, item) => total + Number(item.preco) * (Number(item.quantidade) || 1),
      0
    );

    const external_reference = uuidv4();

    const pagamentoData = {
      transaction_amount,
      description: "Pedido Loja Online",
      payment_method_id: "pix",
      payer: { email },
      external_reference,
      notification_url: `${process.env.BASE_URL}/api/mp/webhook`,
    };

    const payment = await new Payment(mpClient).create({ body: pagamentoData });

    const pedido = new Pedido({
      itens,
      email,
      status: "pendente",
      payment_id: payment.id,
      external_reference,
    });
    await pedido.save();

    res.status(200).json({
      message: "Pix criado com sucesso ✅",
      id: payment.id,
      qr_code: payment.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (e) {
    console.error("❌ Erro ao criar Pix:", e);
    res.status(500).json({ error: "Falha ao criar Pix", detalhes: e.message });
  }
}
