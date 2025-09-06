const express = require("express");
const router = express.Router();
const Produto = require("../models/produto");




router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});


router.post("/", async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.json(novoProduto);
  } catch (err) {
    console.error("Erro ao adicionar produto:", err.message);
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
});

module.exports = router;

