import React from "react";
import CardItem from "./CardItem.jsx";

export default function CardGrid({cards, onOpen, onUnlock}) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map(c=> <CardItem key={c._id || c.id} card={c} onOpen={onOpen} onUnlock={onUnlock} />)}
    </div>
  );
}
