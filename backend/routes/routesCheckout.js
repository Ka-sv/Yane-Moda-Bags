import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import mp from '../config/mercadopago.js'; // importando configuração

const router = express.Router();

// Criar cobrança Pix
router.post('/', async (req, res) => {
  try {
    const { itens, orderId } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Itens inválidos' });
    }

    const amount = Number(
      itens.reduce((s, i) => s + Number(i.preco) * Number(i.quantidade || 1), 0).toFixed(2)
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const paymentData = {
      transaction_amount: amount,
      description: 'Compra na Yane Moda & Bags',
      payment_method_id: 'pix',
      date_of_expiration: expiresAt,
      external_reference: String(orderId || Date.now()),
      notification_url: `${process.env.APP_URL}/api/mp/webhook`,
      payer: { email: 'cliente@example.com' },
    };

    const idempotencyKey = uuidv4();
    const payment = await mp.payment.create(paymentData, { idempotencyKey });

    const tx = payment.body.point_of_interaction?.transaction_data || {};

    res.json({
      orderId: payment.body.id,
      amount,
      expiresAt,
      pix_qr_base64: tx.qr_code_base64,
      pix_copia_cola: tx.qr_code,
      ticket_url: tx.ticket_url || null,
      status: payment.body.status,
    });
  } catch (e) {
    console.error('Erro ao criar pagamento Pix:', e?.response?.data || e.message);
    res.status(500).json({ error: 'Falha ao criar pagamento Pix' });
  }
});

export default router;
