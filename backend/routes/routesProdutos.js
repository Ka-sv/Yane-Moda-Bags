const express = require("express");
const router = express.Router();
const Produto = require("../models/produto");
const produtoRoutes = require("./routes/routesProdutos");



router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});


// Adicionar novo produto
router.post("/", async (req, res) => {
  const novoProduto = new Produto(req.body);
  await novoProduto.save();
  res.json(novoProduto);
});

module.exports = router;

