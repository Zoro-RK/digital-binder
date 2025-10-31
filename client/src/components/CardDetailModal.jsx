import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";


const rarityClass = (rarity) =>
  ({
    common: "card-glow-common",
    uncommon: "card-glow-uncommon",
    rare: "card-glow-rare",
    ultra: "card-glow-ultra",
    legendary: "card-glow-legendary",
  }[rarity?.toLowerCase()] || "card-glow-common");

export default function CardDetailModal({
  open,
  onClose,
  card,
  isNew = false,
  onPrev,
  onNext,
  prevCard,
  nextCard
}) {
  const currentRef = useRef();
  const prevRef = useRef();
  const nextRef = useRef();

  useEffect(() => {
    if (!open || isNew || !card) return;

    // Animate current card zoom in
    gsap.fromTo(
      currentRef.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    // Animate details panel
    gsap.fromTo(
      ".details",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.2 }
    );

    // Animate prev/next cards sliding in
    if (prevRef.current) {
      gsap.fromTo(
        prevRef.current,
        { x: -100, opacity: 0.6, scale: 0.85 },
        { x: 0, opacity: 0.8, scale: 0.9, duration: 0.5, ease: "power2.out" }
      );
    }
    if (nextRef.current) {
      gsap.fromTo(
        nextRef.current,
        { x: 100, opacity: 0.6, scale: 0.85 },
        { x: 0, opacity: 0.8, scale: 0.9, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [open, isNew, card, prevCard, nextCard]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") onPrev?.();
      else if (e.key === "ArrowRight") onNext?.();
      else if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onPrev, onNext, onClose, open]);

  if (!open || !card) return null;
  const id = card.id || card._id || "unknown";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      onClick={(e) => {
        const middle = window.innerWidth / 2;
        if (e.clientX < middle) onPrev?.();
        else onNext?.();
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-800 via-purple-900 to-blue-900" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-lines pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%)",
          width: "200%",
          height: "200%",
          animation: "shineMove 8s linear infinite",
        }}
      />

      {/* Close Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose?.(); }}
        className="absolute top-4 right-4 z-50 text-white bg-transparent text-2xl font-bold p-2 rounded-full hover:text-white transition-colors"
      >
        ×
      </button>

      {/* Card Images */}
      <div className="relative flex items-center justify-center space-x-6">
        {/* Previous Card */}
        {prevCard && (
          <img
            ref={prevRef}
            src={prevCard.imageUrl}
            alt={prevCard.name}
            className="w-52 h-auto object-contain rounded-lg filter grayscale opacity-80 shadow-lg select-none"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

        {/* Current Card */}
        <div
          ref={currentRef}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative w-72 sm:w-80 md:w-96 rounded-xl overflow-hidden shadow-2xl ${rarityClass(
            card.rarity
          )}`}
        >
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-auto object-contain block rounded-lg select-none"
            draggable="false"
          />
        </div>

        {/* Next Card */}
        {nextCard && (
          <img
            ref={nextRef}
            src={nextCard.imageUrl}
            alt={nextCard.name}
            className="w-52 h-auto object-contain rounded-lg filter grayscale opacity-80 shadow-lg select-none"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>

      {/* Details */}
      <div
        className="details fixed bottom-0 inset-x-0 z-20 px-6 py-6 bg-white/85 backdrop-blur-md shadow-xl text-black rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{card.name}</h2>
              <p className="text-xs opacity-70">{card.game || card.series}</p>
            </div>
            <span className="text-base font-semibold capitalize">{card.rarity}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-6 text-sm">
            <div>
              <strong>ID:</strong> {id}
            </div>
            <div className="sm:text-center">
              <strong>Set:</strong> {card.set || "—"}
            </div>
            <div>
              <strong>Type/Tags:</strong> {card.categories?.join(" • ") || card.type  ||  "—"},{card.categories?.join(" • ") || card.tags  ||  "—"}
            </div>
            <div className="sm:text-right">
              <strong>Price:</strong> {card.price ? `$${card.price}` : "—"}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shineMove {
          0% { transform: translate(-150%, -150%); }
          100% { transform: translate(150%, 150%); }
        }

        .bg-lines {
          background-image:
            repeating-linear-gradient(
              60deg,
              rgba(255, 255, 255, 0.08) 0px,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px,
              transparent 60px
            ),
            repeating-linear-gradient(
              -60deg,
              rgba(255, 255, 255, 0.08) 0px,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px,
              transparent 60px
            );
          background-size: 60px 60px;
        }
      `}</style>
    </div>,
    document.body
  );
}
