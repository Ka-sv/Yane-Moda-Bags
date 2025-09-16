const express = require("express");
const { processarEvento } = require("../services/processarEvento");

const router = express.Router();

// Mercado Pago chama aqui
router.post("/", async (req, res) => {
  try {
    await processarEvento(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error("❌ Erro no webhook:", e);
    res.sendStatus(500);
  }
});

module.exports = router;
