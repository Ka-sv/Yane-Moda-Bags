const express = require("express");
const router = express.Router();
const Produto = require("../models/produto");


// Listar todos os produtos
router.get("/", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

// Adicionar novo produto
router.post("/", async (req, res) => {
  const novoProduto = new Produto(req.body);
  await novoProduto.save();
  res.json(novoProduto);
});

module.exports = router;
