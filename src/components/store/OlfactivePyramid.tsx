"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface OlfactivePyramidProps {
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  compact?: boolean;
}

const LAYER_COLORS = [
  "#E07B39", // amaderado
  "#C0392B", // cálido especiado
  "#E67E22", // afrutados
  "#F39C12", // cítrico
  "#27AE60", // aromático
  "#1ABC9C", // tropical
  "#8E44AD", // lavanda
  "#E91E8C", // florales
  "#F1C40F", // avainillado
  "#D4AC0D", // ámbar
];

export function OlfactivePyramid({ notes, compact = false }: OlfactivePyramidProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const allNotes = [
    ...notes.base.map((n, i) => ({ note: n, color: LAYER_COLORS[i % 3], layer: "Base" })),
    ...notes.heart.map((n, i) => ({ note: n, color: LAYER_COLORS[3 + (i % 4)], layer: "Corazón" })),
    ...notes.top.map((n, i) => ({ note: n, color: LAYER_COLORS[7 + (i % 3)], layer: "Salida" })),
  ];

  if (allNotes.length === 0) return null;

  return (
    <div className={compact ? "w-full" : "w-full max-w-md mx-auto"}>
      {!compact && (
        <h3 className="text-sm font-semibold tracking-widest uppercase text-gold mb-4">
          Pirámide Olfativa
        </h3>
      )}

      <div className="space-y-1.5">
        {allNotes.map(({ note, color, layer }, i) => {
          const width = 40 + (i / allNotes.length) * 60;
          return (
            <div
              key={note}
              className="relative flex items-center"
              onMouseEnter={() => setHovered(note)}
              onMouseLeave={() => setHovered(null)}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${width}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="relative h-8 flex items-center cursor-pointer"
                style={{ backgroundColor: color, minWidth: "80px" }}
              >
                <span className="px-3 text-xs font-medium text-white/90 whitespace-nowrap overflow-hidden">
                  {note}
                </span>
              </motion.div>

              {hovered === note && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-[calc(100%+8px)] z-10 bg-card border border-border px-3 py-1.5 text-xs text-white whitespace-nowrap shadow-lg"
                >
                  <span className="text-gold">{layer}</span> — {note}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: LAYER_COLORS[7] }} />
            Salida
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: LAYER_COLORS[3] }} />
            Corazón
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: LAYER_COLORS[0] }} />
            Base
          </span>
        </div>
      )}
    </div>
  );
}
