// routes/routesWebhookMp.js
import express from "express";
import Pedido from "../models/Pedido.js";
import mercadopago from "mercadopago";

const router = express.Router();

// Recebe notificações do Mercado Pago
router.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    // Só processa notificações de pagamento
    if (type === "payment") {
      const paymentId = data.id;

      // Pega status do pagamento no Mercado Pago
      const payment = await mercadopago.payment.findById(paymentId);
      const status = payment.body.status; // ex: "approved", "pending"

      // Atualiza pedido no banco
      let novoStatus = "pendente";
      if (status === "approved") novoStatus = "aprovado";
      else if (status === "rejected") novoStatus = "rejeitado";

      await Pedido.findOneAndUpdate(
        { payment_id: paymentId },
        { status: novoStatus }
      );

      console.log(`✅ Pedido ${paymentId} atualizado para ${novoStatus}`);
    }

    res.sendStatus(200);
  } catch (e) {
    console.error("❌ Erro webhook:", e);
    res.sendStatus(500);
  }
});

// 🔑 Export para ES Modules
export default router;
