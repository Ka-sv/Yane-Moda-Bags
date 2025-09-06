require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "https://yane-moda-bags.vercel.app"  
}));

app.use(express.json());

// Rotas de produtos
const produtoRoutes = require("./routes/routesProdutos");
app.use("/api/produtos", produtoRoutes);

// Rota de checkout/Pix
const checkoutRoutes = require("./routes/checkout"); // <-- aqui o arquivo que você criou
app.use("/api/checkout", checkoutRoutes);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectado!"))
.catch(err => console.error("Erro MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
