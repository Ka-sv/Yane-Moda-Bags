// routes/routesProdutos.js
import express from "express";
import Produto from "../models/produto.js"; // 🔑 lembre-se do .js no import local

const router = express.Router();

// GET - listar todos os produtos
router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// POST - adicionar um novo produto
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


export default router;
