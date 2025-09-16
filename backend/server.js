require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ------------------- Configuração de CORS -------------------
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5000",
  "https://yane-moda-bags.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman, fetch sem origin
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.warn("CORS não permitido para:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

// ------------------- Rotas -------------------
// Produtos
const produtoRoutes = require("./routes/routesProdutos");
app.use("/api/produtos", produtoRoutes);

// Checkout
const checkoutRoutes = require("./routes/routesCheckout");
app.use("/api/checkout", checkoutRoutes);

// Webhook Mercado Pago
const webhookRoutesMp = require("./routes/routesWebhookMp");
app.use("/api/mp/webhook", webhookRoutesMp);

// PIX (descomente se quiser ativar)
// const pixRoutes = require("./routes/routesPix");
// app.use("/api/pix", pixRoutes);

// Status pedido
const Pedido = require("./models/Pedido");
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

// ------------------- Conexão MongoDB -------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro MongoDB:", err));

// ------------------- Servidor -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
