const { Payment } = require("mercadopago");
const mpClient = require("../config/mpClient");
const Pedido = require("../models/Pedido");

const processarEvento = async (event) => {
  try {
    console.log("Evento recebido:", event);

    if (event.type !== "payment" && !event.action?.includes("payment")) {
      console.log("Evento ignorado:", event.type || event.action);
      return;
    }

    const paymentId = event.data.id;
    const payment = await new Payment(mpClient).get({ id: paymentId });

    const pedido = await Pedido.findOne({ payment_id: paymentId });
    if (!pedido) {
      console.warn("Pedido não encontrado para payment_id:", paymentId);
      return;
    }

    let novoStatus = "pendente";
    switch (payment.status) {
      case "approved":
        novoStatus = "aprovado";
        break;
      case "rejected":
      case "cancelled":
        novoStatus = "rejeitado";
        break;
    }

    pedido.status = novoStatus;
    await pedido.save();
    console.log(`✅ Pedido ${pedido.payment_id} atualizado para ${novoStatus}`);

  } catch (error) {
    console.error("❌ Erro ao processar evento:", error);
  }
};

module.exports = { processarEvento };
