import express from "express";
import Pedido from "../models/Pedido.js";

const router = express.Router();



router.get("/pagos", async (req, res) => {
  try {
    const pedidosPagos = await Pedido.find({ status: "approved" });
    res.json(pedidosPagos);
  } catch (err) {
    console.error("❌ Erro ao buscar pedidos pagos:", err); // 👈 log detalhado
    res.status(500).json({ 
      error: "Erro ao buscar pedidos pagos", 
      detalhe: err.message 
    });
  }
});

// Listar todos os pedidos
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
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});





export default router;
