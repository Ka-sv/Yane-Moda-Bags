require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Configuração de CORS
const allowedOrigins = [
  "https://yane-moda-bags.vercel.app",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
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

// Rota PIX
const pixRoutes = require("./routes/routesPix");
app.use("/api/pix", pixRoutes); // ✅ rota registrada antes do listen

// Rota de teste status
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
