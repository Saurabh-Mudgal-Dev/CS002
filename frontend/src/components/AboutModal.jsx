import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Coffee, Info, Award, Users, BookOpen, Layers } from "lucide-react";

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-3xl coffee-glass p-6 sm:p-7 shadow-2xl border max-h-[90vh] overflow-y-auto"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#9c6644] to-[#d97706] flex items-center justify-center text-[#fbbf24] shadow-lg shadow-[#d97706]/20">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg" style={{ color: "var(--text-primary)" }}>ResourceOne Platform</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Smart Inventory & Resource Operations Architecture
                </p>
                <p className="text-[10px] font-mono mt-1" style={{ color: "var(--text-muted)" }}>
                  Version 1.0.0
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-5 space-y-4 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
            {/* Overview */}
            <div className="p-4 rounded-2xl border space-y-2" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
              <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--gold-vivid)" }}>
                <Info className="w-4 h-4" />
                Mission & Dual Operations Architecture
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                ResourceOne bridges the gap between grassroots humanitarian logistics and small commercial retailers. Powered by a unified relational schema, it seamlessly adapts between <strong style={{ color: "var(--gold-vivid)" }}>Community NGOs</strong> (relief rations, donation grants) and <strong style={{ color: "var(--gold-warm)" }}>Small Businesses</strong> (vendor replenishment, counter sales).
              </p>
            </div>

            {/* Architecture Stack */}
            <div className="p-4 rounded-2xl border space-y-2.5" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
              <h5 className="font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Layers className="w-3.5 h-3.5" style={{ color: "var(--gold-warm)" }} />
                Technical Implementation Stack
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>FastAPI</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>REST Backend</div>
                </div>
                <div className="p-2 rounded-xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>SQLite / SQLA</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Relational DB</div>
                </div>
                <div className="p-2 rounded-xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>React 19</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Vite & Motion</div>
                </div>
                <div className="p-2 rounded-xl border" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>Tailwind v4</div>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Espresso/Latte</div>
                </div>
              </div>
            </div>

            {/* Academic Supervision & Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
                <h5 className="font-bold text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <Award className="w-3.5 h-3.5" style={{ color: "var(--gold-warm)" }} />
                  Faculty Mentorship
                </h5>
                <div className="space-y-1">
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Dr. Pinki Kumari</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Faculty Mentor & Project Supervisor</div>
                  <div className="text-[11px]" style={{ color: "var(--text-dim)" }}>Department of Computer Science & Engineering</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
                <h5 className="font-bold text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <Users className="w-3.5 h-3.5" style={{ color: "var(--gold-warm)" }} />
                  Engineering Team
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: "var(--gold-vivid)" }}>Saurabh (Lead)</span>
                    <span className="font-mono" style={{ color: "var(--text-muted)" }}>2501010045</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-primary)" }}>Gargi Verma</span>
                    <span className="font-mono" style={{ color: "var(--text-muted)" }}>2501010223</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-primary)" }}>Rishita</span>
                    <span className="font-mono" style={{ color: "var(--text-muted)" }}>2501010228</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-primary)" }}>Krishyangi Dixit</span>
                    <span className="font-mono" style={{ color: "var(--text-muted)" }}>2501010156</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-primary)" }}>Anveshna</span>
                    <span className="font-mono" style={{ color: "var(--text-muted)" }}>2501010130</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UN SDG Impact */}
            <div className="p-4 rounded-2xl border space-y-2.5" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
              <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--gold-warm)" }} />
                UN Sustainable Development Goals (SDGs)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
                  <span className="font-bold" style={{ color: "var(--gold-vivid)" }}>SDG 2: Zero Hunger</span>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Prevents ration waste & speeds emergency food supplies.</p>
                </div>
                <div className="p-2.5 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
                  <span className="font-bold" style={{ color: "var(--gold-vivid)" }}>SDG 3: Health & Well-being</span>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Tracks vital first aid & essential medicines during crises.</p>
                </div>
                <div className="p-2.5 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
                  <span className="font-bold" style={{ color: "var(--gold-vivid)" }}>SDG 8: Economic Growth</span>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Empowers small retail merchants with transparent bookkeeping.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}