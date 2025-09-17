// routes/routesWebhookMp.js
import express from "express";
import processarEvento from "../services/processarEvento.js";
// import { processarEvento } from "../services/processarEvento.js"; // 🔑 lembre-se do .js no import local

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

// 🔑 Export para ES Modules
export default router;
