// Aqui você processa os eventos recebidos do Mercado Pago
const processarEvento = (event) => {
    console.log("Evento recebido:", event);
  
    const { type, data } = event;
  
    switch (type) {
      case "payment.created":
        console.log("Pagamento criado:", data);
        // atualizarPedido(data.id, "criado");
        break;
  
      case "payment.updated":
        console.log("Pagamento atualizado:", data);
        // atualizarPedido(data.id, data.status);
        break;
  
      case "refund.created":
        console.log("Estorno criado:", data);
        // atualizarPedido(data.id, "estornado");
        break;
  
      case "chargeback.created":
        console.log("Contestação criada:", data);
        // atualizarPedido(data.id, "contestacao");
        break;
  
      default:
        console.log("Evento não tratado:", type);
    }
  };
  
  module.exports = { processarEvento };
  