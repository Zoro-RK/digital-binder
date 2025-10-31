import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

function Sparkle({ x, y, size = 12, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0.2, scale: 0.6, rotate: 0 },
      {
        opacity: 1,
        scale: 1,
        rotate: 360,
        duration: 2 + Math.random() * 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay,
      }
    );
  }, [delay]);
  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <path
        d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

const rarityClass = (rarity) =>
  ({
    common:
      "linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)",
    uncommon:
      "linear-gradient(135deg, transparent 35%, rgba(173,216,230,0.6) 50%, transparent 65%)",
    rare:
      "linear-gradient(135deg, transparent 35%, rgba(255,255,150,0.7) 50%, transparent 65%)",
    ultra:
      "linear-gradient(135deg, transparent 35%, rgba(255,200,255,0.8) 50%, transparent 65%)",
    legendary:
      "linear-gradient(135deg, transparent 35%, rgba(255,120,120,0.85) 50%, transparent 65%)",
  }[rarity?.toLowerCase()] ||
    "linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)");

export default function UnlockModal({ card, onCancel, onComplete, onDetails }) {
  const modalRef = useRef(null);
  const cardRef = useRef(null);
  const shineRef = useRef(null);
  const flashRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 10,
        delay: Math.random() * 2,
        key: i,
      })),
    []
  );

  const getBackImage = () => {
    if (card.game?.includes("Pokémon")) {
      return "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";
    }
    if (card.game?.includes("One Piece")) {
      return "https://static.wikia.nocookie.net/onepiece/images/f/f6/OnePiece_Card_Back.png";
    }
    return "";
  };
  const backUrl = getBackImage();

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
  }, []);

  // Looping diagonal shine when locked OR unlocked
  useEffect(() => {
    if (!shineRef.current) return;

    const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
    loop.fromTo(
      shineRef.current,
      { backgroundPosition: "-150% -150%" },
      {
        backgroundPosition: "150% 150%",
        duration: 2.8,
        ease: "power2.inOut",
      }
    );

    return () => loop.kill();
  }, [unlocked]);

  if (!card) return null;

  const handleUnlock = () => {
    if (!cardRef.current) return;
    setUnlocked(true);

    const tl = gsap.timeline();

    tl.fromTo(
      flashRef.current,
      { opacity: 1 },
      { opacity: 0, duration: 1.2, ease: "power2.out" },
      0
    );

    tl.to(
      modalRef.current.querySelector(".bg-layer"),
      {
        background: "linear-gradient(to bottom, #1a4d8f, #0f66c2, #1c8ee6)",
        duration: 2,
        ease: "power2.inOut",
      },
      0.1
    );

    tl.to(
      cardRef.current,
      {
        rotateY: 360,
        duration: 1.8,
        ease: "power4.inOut",
      },
      0.2
    );

    tl.to(
      cardRef.current.querySelector("img"),
      {
        filter: "grayscale(0%)",
        duration: 2,
        ease: "power2.inOut",
      },
      0
    );

    // Show NEW tag
    tl.to(
      "#newTag",
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(2)",
      },
      "-=0.4"
    );
  };

  const lockedFilter =
    card.status === "locked" && !unlocked ? "grayscale(100%)" : "";

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={() => {
        if (!unlocked) {
          onCancel?.();
        } else {
          // 🔥 After unlock, clicking anywhere opens details automatically
          onComplete?.(card);
          onDetails?.(card);
        }
      }}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-layer ${
          unlocked
            ? "bg-gradient-to-b from-[#1a4d8f] via-[#0f66c2] to-[#1c8ee6]"
            : "bg-gradient-to-b from-[#001937] via-[#072b56] to-[#0b3668]"
        }`}
      />

      {/* White flash overlay */}
      <div ref={flashRef} className="absolute inset-0 bg-white opacity-0" />

      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((s) => (
          <Sparkle key={s.key} x={s.x} y={s.y} size={s.size} delay={s.delay} />
        ))}
      </div>

      {/* Card + Info */}
      <div
        className="relative flex flex-col items-center text-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* NEW Tag */}
        {unlocked && (
          <div
            id="newTag"
            className="opacity-0 scale-0 mb-2 px-4 py-1 bg-yellow-400 text-black font-bold rounded-full shadow-lg"
          >
            NEW
          </div>
        )}

        {/* Card */}
        <div
          ref={cardRef}
          className="relative w-72 sm:w-80 md:w-96 aspect-[63/88] rounded-xl overflow-hidden preserve-3d"
        >
          <img
            src={card.imageUrl}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: lockedFilter, backfaceVisibility: "hidden" }}
            draggable="false"
            onContextMenu={(e) => e.preventDefault()} // disable right-click
          />
          <img
            src={backUrl}
            alt="Card back"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", filter: lockedFilter }}
            draggable="false"
            onContextMenu={(e) => e.preventDefault()} // disable right-click
          />

          <div
            ref={shineRef}
            className="absolute inset-0 opacity-80 pointer-events-none"
            style={{
              background: rarityClass(card.rarity),
              backgroundSize: "250% 250%",
              backgroundRepeat: "no-repeat",
              mixBlendMode: "screen",
            }}
          />
        </div>

        {/* Info */}
        <div className="mt-2">
          <div className="text-white text-2xl font-semibold tracking-wide">
            {card.name}
          </div>
          <div className="text-white/70 text-sm">#{card.id}</div>
        </div>

        {/* Unlock Button */}
        {!unlocked && (
          <button
            onClick={handleUnlock}
            className="mt-2 px-10 py-3 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold shadow-lg hover:scale-105 transition"
          >
            ✨ Unlock
          </button>
        )}

        {/* Details Button */}
        {unlocked && (
          <button
            onClick={() => {
              onComplete?.(card);
              onDetails?.(card);
            }}
            className="mt-4 px-8 py-2 rounded-full bg-blue-500 text-white font-semibold shadow-lg hover:bg-blue-600 transition"
          >
            View Details
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
