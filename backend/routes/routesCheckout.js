import express from "express";
import fetch from "node-fetch";

const router = express.Router();


// ------------------- Rota de checkout Pix real -------------------
router.post("/pix", async (req, res) => {
  try {
    const { email, firstName, lastName, itens } = req.body;

    console.log("📩 Dados recebidos do frontend:", req.body);

    if (!email || !firstName || !lastName || !itens?.length) {
      return res.status(400).json({ error: "Dados de checkout inválidos" });
    }

    // Calcular valor total (garantindo que seja número)
    const transaction_amount = Number(itens.reduce(
      (total, item) => total + (Number(item.preco) || 0) * (Number(item.quantidade) || 0),
      0
    ).toFixed(2));
    
    

    const mpItems = itens.map(item => ({
      title: item.nome,
      quantity: Number(item.quantidade),
      unit_price: Number(item.preco),
    }));

    console.log("📦 Itens enviados ao Mercado Pago:", mpItems);
    console.log("💰 Valor total calculado:", transaction_amount, typeof transaction_amount);

    

    const paymentData = {
      transaction_amount: Number(transaction_amount),
      description: "Compra Yane Moda & Bags",
      payment_method_id: "pix",
      payer: { 
        email,
        first_name: firstName,
        last_name: lastName
      }
    };
    
    console.log("💰 Valor final enviado:", paymentData.transaction_amount, typeof paymentData.transaction_amount);

    
    

    console.log("🚀 Enviando dados pagamento Pix:", paymentData);

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
      console.error("❌ Erro Mercado Pago:", data);
      return res.status(response.status).json(data);
    }

    res.json({
      id: data.id,
      status: data.status,
      transaction_amount,
      pix_qr_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code || null,
      raw_response: data  
    });

    // res.json({
    //   id: data.id,
    //   status: data.status,
    //   transaction_amount,
    //   pix_qr_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
    //   pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code,
    // });

  } catch (error) {
    console.error("❌ Erro ao finalizar compra:", error);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});

// ------------------- Rota para verificar status de pagamento -------------------
router.get("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔎 Verificando status pagamento ID:", id);

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    console.log("🔍 Status pagamento:", data);

    if (!response.ok) {
      console.error("❌ Erro Mercado Pago (status):", data);
      return res.status(response.status).json(data);
    }

    res.json({ status: data.status });

  } catch (error) {
    console.error("❌ Erro ao buscar status do pagamento:", error);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
});

export default router;
