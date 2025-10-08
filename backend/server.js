// ------------------- IMPORTS -------------------
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Rotas
import produtoRoutes from "./routes/routesProdutos.js";
import pedidosRoutes from "./routes/routesPedidos.js";
import checkoutRoutes from "./routes/routesCheckout.js";
import webhookRoutesMp from "./routes/routesWebhookMp.js";

// Modelo
import Pedido from "./models/Pedido.js";

// ------------------- CONFIGURAÇÃO -------------------
const app = express();

const allowedOrigins = [
  "https://yane-moda-bags.vercel.app",
  "http://127.0.0.1:5500",
  "http://localhost:5000",
  "http://www.yaneloja.com.br",
  "https://www.yaneloja.com.br"

];

// ------------------- CORS -------------------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

// Permitir JSON
app.use(express.json());

// ------------------- ROTAS -------------------
app.use("/api/produtos", produtoRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/mp/webhook", webhookRoutesMp);

console.log("✅ Rotas de pedidos ativas em /api/pedidos");

// ------------------- STATUS PEDIDO -------------------
app.get("/orders/:id/status", async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ external_reference: req.params.id });
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json({ status: pedido.status });
  } catch (e) {
    console.error("Erro ao consultar status:", e);
    res.status(500).json({ error: "Falha ao consultar status" });
  }
});
;

app.get("/ping", (req, res) => {
  res.send("checkout ok 🚀");
});

import freteRoutes from "./routes/frete.js";
app.use("/api/frete", freteRoutes);


// ------------------- CONEXÃO MONGODB -------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro MongoDB:", err));

// ------------------- SERVIDOR -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
