import mongoose from "mongoose";

const CupomSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true },
    tipo: { type: String, enum: ["frete", "percentual"], required: true },
    valor: { type: Number, required: true }, // ex: 0 (frete grátis) ou 15 (%)
    ativo: { type: Boolean, default: true },
    descricao: { type: String },
    validade: { type: Date }, // opcional
    usoUnico: { type: Boolean, default: false }, // para “primeira compra”
  },
  { timestamps: true }
);

export default mongoose.models.Cupom || mongoose.model("Cupom", CupomSchema);
