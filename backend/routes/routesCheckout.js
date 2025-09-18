import express from "express";
import fetch from "node-fetch"; // ou axios

const router = express.Router();

// Rota de teste Pix
router.post("/teste-pix", async (req, res) => {
  try {
    const testePaymentData = {
      transaction_amount: 1.0,
      description: "Teste Pix Produção",
      payment_method_id: "pix",
      payer: {
        email: "artemadeiradong@gmail.com",
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(testePaymentData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erro no teste Pix:", error);
    res.status(500).json({ error: "Erro ao processar teste Pix" });
  }
});

// Rota de checkout Pix real
router.post("/pix", async (req, res) => {
  try {
    const { email, firstName, lastName, itens } = req.body;

    // Calcular valor total
    const transaction_amount = itens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0
    );

    // Mapear itens para os nomes corretos do Mercado Pago
    const mpItems = itens.map(item => ({
      title: item.nome,
      quantity: item.quantidade,
      unit_price: item.preco
    }));

    const paymentData = {
      transaction_amount,
      description: "Compra Yane Moda & Bags",
      payment_method_id: "pix",
      payer: { email },
      additional_info: {
        items: mpItems,
        payer: { first_name: firstName, last_name: lastName },
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});

// Rota para verificar status de pagamento
router.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });
    const data = await response.json();
    res.json({ status: data.status });
  } catch (error) {
    console.error("Erro ao buscar status do pagamento:", error);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});


export default router;
