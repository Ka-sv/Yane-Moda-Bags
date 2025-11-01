import mongoose from "mongoose";
import slugify from "slugify"; // instale: npm i slugify

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: String,
  imagens: [String],
  slug: { type: String, unique: true }, // novo campo amigável na URL
}, { timestamps: true });

// 🔹 Gera o slug automaticamente antes de salvar
ProdutoSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.nome, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Produto", ProdutoSchema);
