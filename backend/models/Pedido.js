const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, 
  itens: [
    {
      nome: { type: String, required: true },      
      preco: { type: Number, required: true },      
      quantidade: { type: Number, default: 1 },     
    }
  ],
  email: { type: String, required: true },         
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },
  paymentId: { type: String },                      
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pedido", PedidoSchema);
