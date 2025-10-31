import mongoose from "mongoose";

const schema = new mongoose.Schema({
  id: { type: String },
  number: { type: Number },
  name: { type: String, required: true },
  game: { type: String, default: "Pokemon TCG" },
  gameShort: { type: String, default: "PK" },
  set: { type: String },
  setShort: { type: String },
  rarity: { type: String, required: true },
  type: { type: String },
  marketPrice: { type: Number },
  categories: { type: [String], default: [] },
  imageUrl: { type: String, required: true },
  locked: { type: Boolean, default: true },
  status: { type: String, enum: ["locked","unlocked"], default: "locked" },
  details: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("PokeCard", schema, "pokecards");
