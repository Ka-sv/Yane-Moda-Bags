require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: "https://yane-moda-bags.vercel.app"  
}));
app.use(express.json());

// Rotas de produtos
const produtoRoutes = require("./routes/routesProdutos");
app.use("/api/produtos", produtoRoutes);

// Rota de checkout
const checkoutRoutes = require("./routes/routesCheckout");
app.use("/api/checkout", checkoutRoutes);

// Webhook do Mercado Pago
const webhookRoutesMp = require("./routes/routesWebhookMp");
app.use("/api/mp/webhook", webhookRoutesMp);


app.get("/orders/:id/status", async (req, res) => {
  try {
    res.json({ status: "pending" });
  } catch (e) {
    console.error("Erro ao consultar status:", e);
    res.status(500).json({ error: "Falha ao consultar status" });
  }
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
