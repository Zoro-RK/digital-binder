import React, { useEffect, useState, useMemo } from "react";
import CardGrid from "../components/CardGrid.jsx";
import UnlockModal from "../components/UnlockModal.jsx";
import CardDetailModal from "../components/CardDetailModal.jsx";
import { fetchOPCards, unlockOP } from "../api.js";

export default function OnePiecePage() {
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(null);
  const [showTop, setShowTop] = useState(false);

  // --- normalize card state ---
  const normalizeCard = (c) => {
    const unlocked =
      c.unlocked === true ||
      c.locked === false ||
      String(c.locked).toLowerCase() === "false" ||
      c.locked === 0 ||
      String(c.locked) === "0";
    return { ...c, unlocked, locked: unlocked ? "false" : "true" };
  };

  // --- fetch cards ---
  const load = async (q = "") => {
    const data = await fetchOPCards(q);
    setCards((data || []).map(normalizeCard));
  };

  useEffect(() => {
    load(""); // fetch on mount

    const onScroll = () => setShowTop(window.scrollY > 250);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleOpen = (card) => {
    setSelected(card);
    setOpen(true);
  };

  const handleUnlock = (card) => setUnlocking(card);

  const onUnlockComplete = async (card) => {
    const id = card._id || card.id;
    await unlockOP(id);

    // Update state locally (no reload)
    setCards((prev) =>
      prev.map((c) =>
        (c._id || c.id) === id
          ? normalizeCard({ ...c, locked: false, unlocked: true })
          : c
      )
    );

    setUnlocking(null);
    setSelected(normalizeCard({ ...card, locked: false, unlocked: true }));
    setOpen(true);
  };

  const onCancelUnlock = () => setUnlocking(null);

  // --- filtered cards ---
  const filteredCards = useMemo(() => {
    if (!query) return cards;
    const q = query.toLowerCase();
    return cards.filter((c) => {
      return (
        c.name?.toLowerCase().includes(q) ||
        c.cardid?.toLowerCase().includes(q) ||
        c.rarity?.toLowerCase().includes(q) ||
        c.set?.toLowerCase().includes(q) ||
        c.setShort?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, cards]);

  // --- unlocked cards list for navigation ---
  const unlockedCards = useMemo(
    () => filteredCards.filter((c) => c.unlocked),
    [filteredCards]
  );

  const currentIndex = unlockedCards.findIndex(
    (c) => (c._id || c.id) === (selected?._id || selected?.id)
  );

  const prevCard = currentIndex > 0 ? unlockedCards[currentIndex - 1] : null;
  const nextCard =
    currentIndex < unlockedCards.length - 1
      ? unlockedCards[currentIndex + 1]
      : null;

  // --- navigation handlers ---
  const goPrev = () => {
    if (currentIndex > 0) setSelected(unlockedCards[currentIndex - 1]);
  };

  const goNext = () => {
    if (currentIndex < unlockedCards.length - 1)
      setSelected(unlockedCards[currentIndex + 1]);
  };

  // --- stats ---
  const total = filteredCards.length;
  const unlockedCount = filteredCards.filter((c) => c.unlocked).length;
  const progress = total ? Math.round((unlockedCount / total) * 100) : 0;

  // --- persistent sparkles ---
  const sparkles = useMemo(
    () =>
      [...Array(40)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 2,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 8,
      })),
    []
  );

  const scrollToTop = () => {
    const step = -window.scrollY / 40;
    const interval = setInterval(() => {
      if (window.scrollY !== 0) window.scrollBy(0, step);
      else clearInterval(interval);
    }, 15);
  };

  return (
    <div
      className="page-onepiece min-h-screen relative overflow-hidden p-6"
      style={{ background: "linear-gradient(180deg,#0b1432 0%, #16244d 100%)" }}
    >
      {/* Sparkle effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-amber-200 opacity-70 animate-fall"
            style={{
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full mx-auto px-8 py-4 relative z-10">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-amber-300 drop-shadow-lg">
            Zoro&apos;s Binder
          </h1>
          <div className="relative w-full sm:w-72">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, ID, rarity, type, set..."
              className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-sm sm:text-base outline-none focus:ring-2 focus:ring-amber-300 bg-white shadow-sm transition text-black"
            />
            <span className="absolute right-3 top-2.5 text-gray-600">🔍</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-amber-300 font-medium">
          <div>
            Cards: <span className="font-semibold">{total}</span>
          </div>
          <div>
            Unlocked: <span className="font-semibold">{unlockedCount}</span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-amber-100/30 overflow-hidden">
            <div
              className="h-2 bg-amber-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
              title={`${progress}%`}
            />
          </div>
          <div className="font-semibold">{progress}%</div>
        </div>

        <hr className="border-t-2 border-gray-400/50 my-4" />

        {/* Card Grid */}
        <CardGrid
          cards={filteredCards}
          onOpen={handleOpen}
          onUnlock={handleUnlock}
        />

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
        <CardDetailModal
          open={open}
          onClose={() => setOpen(false)}
          card={selected}
          onPrev={goPrev}
          onNext={goNext}
          prevCard={prevCard}
          nextCard={nextCard}
        />
      </div>

      {/* Back to top button */}
      {showTop && typeof window !== "undefined" && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-1 right-1 bg-transperent hover:bg-amber-500 text-white font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition z-50"
          title="Back to Top"
        >
          ^
        </button>
      )}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
