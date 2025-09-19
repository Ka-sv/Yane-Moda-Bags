import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// ------------------- Rota de teste Pix -------------------
router.post("/teste-pix", async (req, res) => {
  try {
    const transaction_amount = 1.0;

    const testePaymentData = {
      transaction_amount,
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
    console.log("🔍 Resposta teste Pix:", data);

    // Se deu erro no MP, retorna o erro completo
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Erro no Mercado Pago",
        message: data.message,
        cause: data.cause,
      });
    }

    res.json({
      id: data.id,
      status: data.status,
      transaction_amount,
      pix_qr_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code || null,
    });

  } catch (error) {
    console.error("❌ Erro no teste Pix:", error);
    res.status(500).json({ error: "Erro ao processar teste Pix" });
  }
});

// ------------------- Rota de checkout Pix real -------------------
router.post("/pix", async (req, res) => {
  try {
    const { email, firstName, lastName, itens } = req.body;

    if (!email || !firstName || !lastName || !itens?.length) {
      return res.status(400).json({ error: "Dados de checkout inválidos" });
    }

    // Calcular valor total
    const transaction_amount = itens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0
    );

    const mpItems = itens.map(item => ({
      title: item.nome,
      quantity: item.quantidade,
      unit_price: item.preco,
    }));

    const paymentData = {
      transaction_amount,
      description: "Compra Yane Moda & Bags",
      payment_method_id: "pix",
      payer: { 
        email,
        first_name: firstName,
        last_name: lastName
      },
      additional_info: { items: mpItems },
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
    console.log("🔍 Resposta checkout Pix:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Erro no Mercado Pago",
        message: data.message,
        cause: data.cause,
      });
    }

    res.json({
      id: data.id,
      status: data.status,
      transaction_amount,
      pix_qr_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code,
    });

  } catch (error) {
    console.error("❌ Erro ao finalizar compra:", error);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});

// ------------------- Rota para verificar status de pagamento -------------------
router.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    console.log("🔍 Status pagamento:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Erro no Mercado Pago",
        message: data.message,
        cause: data.cause,
      });
    }

    res.json({ status: data.status });

  } catch (error) {
    console.error("❌ Erro ao buscar status do pagamento:", error);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});

export default router;
