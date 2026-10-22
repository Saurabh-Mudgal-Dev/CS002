import React from "react";
import { motion } from "motion/react";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "caramel", trend }) {
  const themes = {
    caramel: {
      border:  "border-[#3c2a1e]/60 hover:border-[#f5c842]/50",
      iconBg:  "bg-[#f5c842]/15 text-[#f5c842] border-[#f5c842]/25",
      glow:    "from-[#f5c842]/10",
      badge:   "bg-[#f5c842]/12 text-[#f5c842] border-[#f5c842]/25",
    },
    latte: {
      border:  "border-[#3c2a1e]/60 hover:border-[#c68b3a]/50",
      iconBg:  "bg-[#c68b3a]/15 text-[#c68b3a] border-[#c68b3a]/25",
      glow:    "from-[#c68b3a]/10",
      badge:   "bg-[#c68b3a]/12 text-[#c68b3a] border-[#c68b3a]/25",
    },
    amber: {
      border:  "border-amber-500/40 hover:border-amber-500/70",
      iconBg:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
      glow:    "from-amber-500/10",
      badge:   "bg-amber-500/12 text-amber-400 border-amber-500/25",
    },
    rose: {
      border:  "border-rose-500/40 hover:border-rose-500/70",
      iconBg:  "bg-rose-500/15 text-rose-400 border-rose-500/25",
      glow:    "from-rose-500/10",
      badge:   "bg-rose-500/12 text-rose-400 border-rose-500/25",
    },
  };

  const t = themes[color] || themes.caramel;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl coffee-glass p-5 transition-all border ${t.border} group shadow-xl`}
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-subtle)"
      }}
    >
      {/* Ambient glow */}
      <div
        className={`absolute -right-6 -top-6 w-28 h-28 bg-gradient-to-br ${t.glow} to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border ${t.iconBg} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs relative z-10">
        <span className="font-medium truncate max-w-[160px]" style={{ color: "var(--text-muted)" }}>{subtitle}</span>
        {trend && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.badge} shrink-0`}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}
