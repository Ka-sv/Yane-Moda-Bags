import express from "express";
import Cupom from "../models/cupom.js";

const router = express.Router();

// 📋 Listar cupons ativos
router.get("/", async (req, res) => {
  try {
    const cupons = await Cupom.find({ ativo: true });
    res.json(cupons);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar cupons" });
  }
});

// ➕ Criar novo cupom
router.post("/", async (req, res) => {
  try {
    const novoCupom = new Cupom(req.body);
    await novoCupom.save();
    res.json(novoCupom);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar cupom", detalhes: err.message });
  }
});

// ❌ Desativar cupom
router.patch("/:id/desativar", async (req, res) => {
  try {
    const cupom = await Cupom.findByIdAndUpdate(req.params.id, { ativo: false }, { new: true });
    res.json(cupom);
  } catch (err) {
    res.status(400).json({ error: "Erro ao desativar cupom" });
  }
});

// 🔍 Buscar cupom por código
router.get("/:codigo", async (req, res) => {
    try {
      const { codigo } = req.params;
      const cupom = await Cupom.findOne({ codigo: codigo.toUpperCase(), ativo: true });
  
      if (!cupom) {
        return res.status(404).json({ error: "Cupom inválido ou inativo" });
      }
  
      // Verifica validade, se existir
      if (cupom.validade && new Date(cupom.validade) < new Date()) {
        return res.status(400).json({ error: "Cupom expirado" });
      }
  
      res.json(cupom);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar cupom" });
    }
  });
  

export default router;
