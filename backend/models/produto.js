import mongoose from "mongoose";

const VarianteSchema = new mongoose.Schema({
  cor: String,          // ex: "preto", "azul"
  numero: String,       // ex: "38", "M", "Único"
  imagens: [String],    // imagens específicas (opcional)
});

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: String,
  preco: { type: Number, required: true },
  imagens: [String],
  variantes: [VarianteSchema], // combinações de cor e/ou numeração
});

export default mongoose.models.Produto || mongoose.model("Produto", ProdutoSchema);
