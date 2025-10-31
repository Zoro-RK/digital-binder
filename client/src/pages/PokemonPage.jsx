import React, { useEffect, useState } from "react";
import CardGrid from "../components/CardGrid.jsx";
import UnlockModal from "../components/UnlockModal.jsx";
import CardDetailModal from "../components/CardDetailModal.jsx";
import { fetchPokeCards, unlockPoke } from "../api.js";

export default function PokemonPage() {
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(null);
  const [loading, setLoading] = useState(false); // NEW

  // --- helpers ---
  const normalizeCard = (c) => {
    const unlocked =
      c.unlocked === true ||
      c.locked === false ||
      String(c.locked).toLowerCase() === "false" ||
      c.locked === 0 ||
      String(c.locked) === "0";
    return { ...c, unlocked, locked: unlocked ? "false" : "true" };
  };

  const load = async (q = "") => {
    setLoading(true); // NEW
    try {
      const data = await fetchPokeCards(q);
      setCards((data || []).map(normalizeCard));
    } finally {
      setLoading(false); // NEW
    }
  };

  useEffect(() => {
    load(); // initial load triggers progress
  }, []);

  const handleOpen = (card) => {
    setSelected(card);
    setOpen(true);
  };

  const handleUnlock = (card) => setUnlocking(card);

  const onUnlockComplete = async (card) => {
    const id = card._id || card.id;

    // Update DB
    await unlockPoke(id);

    // Optimistic local update
    setCards((prev) =>
      prev.map((c) =>
        (c._id || c.id) === id ? normalizeCard({ ...c, locked: false, unlocked: true }) : c
      )
    );

    // Close Unlock Modal
    setUnlocking(null);

    // Open detail modal automatically
    setSelected(normalizeCard({ ...card, locked: false, unlocked: true }));
    setOpen(true);

    // Reload to ensure counts/progress are accurate
    await load(query);
  };

  const onCancelUnlock = () => setUnlocking(null);

  // --- stats ---
  const total = cards.length;
  const unlockedCount = cards.filter((c) => c.unlocked).length;
  const progress = total ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <div
      className="page-pokemon min-h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #d8efff 0%, rgb(61, 140, 201) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-black drop-shadow-sm">Zoro&apos;s Binder</h1>
          <div className="relative w-full sm:w-72">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                load(e.target.value); // search triggers progress update
              }}
              placeholder="Search name, ID, rarity..."
              className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition text-black"
            />
            <span className="absolute right-3 top-2.5 text-gray-600">🔍</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-black">
          <div>
            Cards: <span className="font-semibold">{total}</span>
          </div>
          <div>
            Unlocked: <span className="font-semibold">{unlockedCount}</span>
          </div>

          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-2 bg-sky-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
              title={`${progress}%`}
            />
          </div>

          <div className="font-medium">
            {loading ? "Loading..." : `${progress}%`}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-gray-300 my-4" />

        {/* Card Grid */}
        <CardGrid cards={cards} onOpen={handleOpen} onUnlock={handleUnlock} />

        {/* Unlock Modal */}
        {unlocking && (
          <UnlockModal
            card={unlocking}
            onCancel={onCancelUnlock}
            onComplete={() => onUnlockComplete(unlocking)}
            onDetails={(card) => {
              setSelected(card);
              setOpen(true);
              setUnlocking(null);
            }}
          />
        )}

        {/* Detail Modal */}
        <CardDetailModal open={open} onClose={() => setOpen(false)} card={selected} />
      </div>
    </div>
  );
}
