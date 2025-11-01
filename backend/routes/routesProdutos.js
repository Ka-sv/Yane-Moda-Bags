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


// GET - produto por ID ou slug
router.get("/:idOuSlug", async (req, res) => {
  try {
    const { idOuSlug } = req.params;

    const produto = await Produto.findOne({
      $or: [{ _id: idOuSlug }, { slug: idOuSlug }]
    });

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(produto);
  } catch (err) {
    console.error("Erro ao buscar produto:", err.message);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
});



export default router;
