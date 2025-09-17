const express = require("express");
const Pedido = require("../models/Pedido");
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 }); 
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

// Consultar status de um pedido específico
router.get("/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

module.exports = router;
