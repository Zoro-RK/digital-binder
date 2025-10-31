import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import OnePiecePage from "./pages/OnePiecePage.jsx";
import PokemonPage from "./pages/PokemonPage.jsx";

function Tab({ to, children, activeColor }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-full border text-black transition-colors ${
          isActive
            ? activeColor
            : "bg-white/60 border-gray-300 text-black/60"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  const [hidden, setHidden] = useState(false);

  // Hide/show header on scroll
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 50) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className={`fixed top-0 z-20 w-full bg-white/70 backdrop-blur border-b transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2">
          <Tab to="/pokemon" activeColor="bg-sky-100 border-sky-300">
            Pokémon
          </Tab>
          <Tab to="/onepiece" activeColor="bg-amber-100 border-amber-300">
            One Piece
          </Tab>
        </div>
      </div>

      {/* Content (shifted by header height so no overlap, no gap) */}
      <main className="min-h-screen mt-[48px]">
        <Routes>
          <Route path="/onepiece" element={<OnePiecePage />} />
          <Route path="/pokemon" element={<PokemonPage />} />
          <Route path="*" element={<Navigate to="/onepiece" replace />} />
        </Routes>
      </main>
    </div>
  );
}
