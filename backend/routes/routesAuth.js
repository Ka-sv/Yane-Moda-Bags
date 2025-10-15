// ------------------- ADMIN AUTH -------------------
import express from "express";
import dotenv from "dotenv";
dotenv.config();

export function registrarRotasAdmin(app) {
  console.log("🔐 Variável ADMIN_PASSWORD carregada?", !!process.env.ADMIN_PASSWORD);
  console.log("🔐 Valor (oculto no log público, apenas para teste local)");

  app.post("/api/auth/admin", (req, res) => {
    const { senha } = req.body;

    console.log("📩 Tentativa de login recebida.");
    console.log("Senha enviada pelo cliente:", senha ? "[RECEBIDA]" : "[VAZIA]");
    console.log("Senha esperada:", process.env.ADMIN_PASSWORD ? "[DEFINIDA]" : "[NÃO DEFINIDA]");

    if (!senha) {
      return res.status(400).json({ ok: false, error: "Senha não informada." });
    }

    if (senha === process.env.ADMIN_PASSWORD) {
      console.log("✅ Senha correta — acesso liberado!");
      return res.json({ ok: true });
    }

    console.warn("❌ Senha incorreta!");
    res.status(401).json({ ok: false, error: "Senha incorreta." });
  });
}
