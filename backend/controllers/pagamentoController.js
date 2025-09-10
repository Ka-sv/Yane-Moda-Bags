
const { Payment } = require("mercadopago");
const mpClient = require("../config/mpClient"); 



const processarEvento = async (event) => {
  try {
    console.log("Evento recebido:", event);

    if (event.type === "payment") {
      const paymentId = event.data.id;

      // Consulta o pagamento no Mercado Pago
      const payment = await new Payment(mpClient).get({ id: paymentId });

      console.log("Detalhes do pagamento:", payment);

      // Exemplo de atualização no banco de dados:
      // atualizarPedido(paymentId, payment.status);

      /*
        payment.status pode ser:
        - "approved"  → pagamento confirmado
        - "pending"   → aguardando pagamento
        - "rejected"  → falhou
      */
    } else {
      console.log("Evento ignorado:", event.type);
    }
  } catch (error) {
    console.error("Erro ao processar evento:", error);
  }
};

module.exports = { processarEvento };
