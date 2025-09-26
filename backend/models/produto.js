import mongoose from "mongoose";

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: String,
  imagens: [String] 
}, { timestamps: true }); 

export default mongoose.model("Produto", ProdutoSchema);
