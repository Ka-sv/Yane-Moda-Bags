const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: String,
  imagem: String
});

module.exports = mongoose.model("Produto", ProdutoSchema);
