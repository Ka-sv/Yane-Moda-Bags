const { Payment } = require("mercadopago");
const mpClient = require("../config/mpClient"); 
const Pedido = require("../models/Pedido");

const processarEvento = async (event) => {
  try {
    console.log("Evento recebido:", event);

    if (event.type !== "payment") {
      console.log("Evento ignorado:", event.type);
      return;
    }

    const paymentId = event.data.id;

    // Consulta o pagamento no Mercado Pago
    const payment = await new Payment(mpClient).get({ id: paymentId });
    console.log("Detalhes do pagamento:", payment);

    // Procura o pedido correspondente no banco
    const pedido = await Pedido.findOne({ paymentId });
    if (!pedido) {
      console.warn("Pedido não encontrado para paymentId:", paymentId);
      return;
    }

    // Atualiza status conforme o pagamento
    let novoStatus = pedido.status;

    switch (payment.status) {
      case "approved":
        novoStatus = "paid";
        break;
      case "pending":
        novoStatus = "pending";
        break;
      case "rejected":
      case "cancelled":
        novoStatus = "expired";
        break;
    }

    pedido.status = novoStatus;
    await pedido.save();

    console.log(`Pedido ${pedido.orderId} atualizado para status: ${novoStatus}`);

  } catch (error) {
    console.error("Erro ao processar evento:", error);
  }
};

module.exports = { processarEvento };
