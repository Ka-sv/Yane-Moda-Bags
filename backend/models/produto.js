import mongoose from "mongoose";

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: String,
  imagem: String
}, { timestamps: true }); // optional: createdAt e updatedAt automáticos

export default mongoose.model("Produto", ProdutoSchema);
