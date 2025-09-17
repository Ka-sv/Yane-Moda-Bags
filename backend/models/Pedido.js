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
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    payment_id: { type: String },
  },
  { timestamps: true }
); // createdAt e updatedAt automáticos

// 👇 se já existir, reutiliza; senão cria
export default mongoose.models.Pedido || mongoose.model("Pedido", PedidoSchema);
