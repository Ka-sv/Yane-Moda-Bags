import express from "express";
import { calcularPrecoPrazo } from "correios-brasil";

const router = express.Router();

// Frete simples
router.post("/fixo", (req, res) => {
  const { tipoEntrega } = req.body;
  let frete = 0, prazo = 0;

  if (tipoEntrega === "delivery") {
    frete = 10;
    prazo = 2;
  }

  res.json({ frete, prazo });
});

// Frete Correios
// Frete Correios com fallback
router.post("/correios", async (req, res) => {
  try {
    let { cepDestino, peso = "1" } = req.body;

    if (!cepDestino || !/^\d{5}-?\d{3}$/.test(cepDestino)) {
      return res.status(400).json({ error: "CEP destino inválido" });
    }

    cepDestino = cepDestino.replace("-", "");

    const args = {
      sCepOrigem: "01001000",
      sCepDestino: cepDestino,
      nCdServico: ["04014"], // SEDEX
      nVlPeso: peso,
      nCdFormato: "1",
      nVlComprimento: "20",
      nVlAltura: "5",
      nVlLargura: "15",
      nVlDiametro: "0",
    };

    console.log("Args enviados aos Correios:", args);

    const resultado = await calcularPrecoPrazo(args);

    console.log("Resultado Correios:", resultado);

    if (!resultado || !resultado[0] || resultado[0].Erro !== "0") {
      console.warn("⚠️ Correios falhou, usando frete fixo");
      return res.json({ frete: 15, prazo: 5 }); // fallback
    }

    res.json({
      frete: parseFloat(resultado[0].Valor.replace(",", ".")),
      prazo: parseInt(resultado[0].PrazoEntrega),
    });
  } catch (error) {
    console.error("❌ Erro ao calcular frete detalhado:", error.message);
    // fallback fixo
    res.json({ frete: 15, prazo: 5 });
  }
});
;


export default router;
