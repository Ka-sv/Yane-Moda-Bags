import mongoose from "mongoose";

const PedidoSchema = new mongoose.Schema(
  {
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

    // 💰 pagamento
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    payment_id: { type: String },

    // 🚚 entrega
    endereco: {
      cep: { type: String },
      rua: { type: String },
      numero: { type: String },
      bairro: { type: String },
      cidade: { type: String },
      estado: { type: String },
      complemento: { type: String },
    },
    metodoEntrega: {
      type: String,
      enum: ["retirada", "delivery"],
      default: "delivery",
    },
    statusEntrega: {
      type: String,
      enum: ["pendente", "em preparo", "saiu para entrega", "entregue", "cancelado"],
      default: "pendente",
    },
  },
  { timestamps: true } // createdAt e updatedAt automáticos
);

export default mongoose.models.Pedido || mongoose.model("Pedido", PedidoSchema);
