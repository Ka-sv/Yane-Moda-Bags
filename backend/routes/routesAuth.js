// ------------------- ADMIN AUTH -------------------
import express from "express";
import dotenv from "dotenv";
dotenv.config();

export function registrarRotasAdmin(app) {
  app.post("/api/auth/admin", (req, res) => {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ ok: false, error: "Senha não informada." });
    }

    if (senha === process.env.ADMIN_PASSWORD) {
      return res.json({ ok: true });
    }

    res.status(401).json({ ok: false, error: "Senha incorreta." });
  });
}
