import mongoose from "mongoose";

const schema = new mongoose.Schema({
  id: { type: String }, // optional external id
  number: { type: Number },
  name: { type: String, required: true },
  game: { type: String, default: "One Piece TCG" },
  gameShort: { type: String, default: "OP" },
  set: { type: String },
  setShort: { type: String },
  rarity: { type: String, required: true },
  type: { type: String },
  price: { type: Number },
  categories: { type: [String], default: [] },
  imageUrl: { type: String, required: true },
  locked: { type: Boolean, default: true },
  status: { type: String, enum: ["locked","unlocked"], default: "locked" },
  details: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("OPCard", schema, "opcards");
