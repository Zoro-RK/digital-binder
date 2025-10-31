import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";

const rarityClass = (rarity) =>
  ({
    common: "card-glow-common",
    uncommon: "card-glow-uncommon",
    rare: "card-glow-rare",
    ultra: "card-glow-ultra",
    legendary: "card-glow-legendary",
  }[rarity?.toLowerCase()] || "card-glow-common");

export default function CardItem({ card, onOpen, onUnlock }) {
  const ref = useRef();
  const shineRef = useRef();

  useLayoutEffect(() => {
    // Shine sweep loop if unlocked
    if (card.unlocked) {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      tl.to(shineRef.current, { opacity: 1, duration: 0.15 })
        .to(shineRef.current, {
          x: "120%",
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
        })
        .set(shineRef.current, { x: "-40%" })
        .to(shineRef.current, { opacity: 0, duration: 0.05 });
      return () => tl.kill();
    }
  }, [card.unlocked]);

  useLayoutEffect(() => {
    const el = ref.current;

    // Hover animation (fast zoom-in, no delay)
    const enter = () => {
      gsap.to(el, {
        scale: 1.07,   // bigger zoom
        duration: 0.05, // ultra fast
        ease: "none",
        boxShadow: "0px 14px 28px rgba(0,0,0,0.4)",
      });
    };

    const leave = () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.05, // instant reset
        ease: "none",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
      });
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  const handle = () => {
    if (card.unlocked) onOpen(card);
    else onUnlock(card);
  };

  return (
    <div
      ref={ref}
      className={`card-tile relative ${rarityClass(card.rarity)} transition-transform`}
    >
      <button onClick={handle} className="w-full text-left">
        <div
          className={`aspect-[3/4] rounded-lg overflow-hidden relative ${
            card.unlocked ? "" : "grayscale"
          }`}
        >
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-cover"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()} // disable right-click
          />
          {card.unlocked && <div ref={shineRef} className="shine"></div>}
        </div>
      </button>
    </div>
  );
}
