const express = require("express");
const crypto = require("crypto");
const mercadopago = require("mercadopago");

const router = express.Router();

const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;

// Função para validar assinatura do Mercado Pago
function verifySignature(xSignature, xRequestId, paymentId) {
  if (!xSignature || !xRequestId || !paymentId || !MP_WEBHOOK_SECRET) return false;

  // Cabeçalho vem como: ts=...,v1=...
  const parts = xSignature.split(",");
  let ts = null;
  let v1 = null;

  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k?.trim() === "ts") ts = v?.trim();
    if (k?.trim() === "v1") v1 = v?.trim();
  }
  if (!ts || !v1) return false;

  // String que deve ser assinada
  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;

  const calc = crypto
    .createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(v1));
}

// Rota de Webhook
router.post("/", async (req, res) => {
  try {
    const paymentId =
      req.query["data.id"] ||
      req.query.id ||
      req.body?.data?.id ||
      req.body?.id;

    const xSignature = req.headers["x-signature"];
    const xRequestId = req.headers["x-request-id"];

    // 1) valida assinatura
    const ok = verifySignature(xSignature, xRequestId, paymentId);
    if (!ok) {
      console.warn("⚠️ Webhook MP: assinatura inválida", { paymentId });
      return res.sendStatus(401);
    }

    // 2) busca o pagamento
    if (!paymentId) return res.sendStatus(200);

    const payment = await mercadopago.payment.findById(paymentId);

    const mpStatus = payment.body.status; // "approved", "pending", "cancelled", "rejected"...
    const externalRef = payment.body.external_reference;

    // 👉 Aqui você atualiza seu pedido no banco
    // Exemplo:
    // await Pedido.updateOne({ orderId: externalRef }, { status: mpStatus });

    console.log("✅ Pagamento atualizado", { paymentId, externalRef, mpStatus });

    return res.sendStatus(200);
  } catch (e) {
    console.error("❌ Erro no webhook MP:", e?.message || e);
    return res.sendStatus(500);
  }
});

module.exports = router;
