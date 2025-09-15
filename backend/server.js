require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// --------------------
// Configuração do CORS
// --------------------
const allowedOrigins = [
  "https://yane-moda-bags.vercel.app",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

// --------------------
// Middleware
// --------------------
app.use(express.json()); // para ler JSON do corpo das requisições

// --------------------
// Rotas
// --------------------
const produtoRoutes = require("./routes/routesProdutos");
app.use("/api/produtos", produtoRoutes);

const checkoutRoutes = require("./routes/routesCheckout");
app.use("/api/checkout", checkoutRoutes);

const webhookRoutesMp = require("./routes/routesWebhookMp");
app.use("/api/mp/webhook", webhookRoutesMp);

// Exemplo de rota de status de pedido
app.get("/orders/:id/status", async (req, res) => {
  try {
    // Aqui você pode integrar com Mercado Pago ou seu DB
    res.json({ status: "pending" });
  } catch (e) {
    console.error("Erro ao consultar status:", e);
    res.status(500).json({ error: "Falha ao consultar status" });
  }
});

// --------------------
// Conexão com MongoDB
// --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro MongoDB:", err));

// --------------------
// Middleware de erro (CORS e outras rotas)
// --------------------
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: err.message });
  } else {
    console.error(err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// --------------------
// Inicialização do servidor
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
