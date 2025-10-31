import { Router } from "express";
import OPCard from "../models/opCard.model.js";
const router = Router();

router.get("/", async (req, res) => {
  const q = req.query.q || "";
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const cards = await OPCard.find(filter).sort({ number: 1, name: 1 });
  res.json(cards);
});

router.get("/:id", async (req, res) => {
  const card = await OPCard.findOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
  if (!card) return res.status(404).json({ message: "Not found" });
  res.json(card);
});

router.patch("/:id/unlock", async (req, res) => {
  const card = await OPCard.findOneAndUpdate(
    { $or: [{ _id: req.params.id }, { id: req.params.id }] },
    { $set: { locked: false, status: "unlocked" } },
    { new: true }
  );
  if (!card) return res.status(404).json({ message: "Not found" });
  res.json(card);
});

export default router;
