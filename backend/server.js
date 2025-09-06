require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();


app.use(cors());
app.use(express.json());


const routesCheckout = require("./routes/routesCheckout");
const produtoRoutes = require("./routes/routesProdutos");

app.use("/api/checkout", routesCheckout);
app.use("/api/produtos", produtoRoutes);


app.get("/", (req, res) => {
  res.send("API da Loja funcionando 🚀");
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch(err => console.error("❌ Erro de conexão:", err));


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
