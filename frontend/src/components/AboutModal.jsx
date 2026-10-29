import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Award, Users, BookOpen, Layers, Sparkles } from "lucide-react";

export default function AboutModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 max-h-[90vh] overflow-y-auto z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-black text-sm shadow-md ring-1 ring-white/20">
                  R1
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                    ResourceOne Platform
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Smart Inventory & Resource Operations Architecture
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Version 1.0.0 · Production Ready
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-5 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {/* Overview */}
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <Info className="w-4 h-4" />
                  Mission & Dual Operations Architecture
                </h4>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  ResourceOne bridges the gap between grassroots humanitarian logistics and small commercial retailers. Powered by a unified relational schema, it seamlessly adapts between <strong className="text-slate-900 dark:text-white">Community NGOs</strong> (relief rations, donation grants) and <strong className="text-slate-900 dark:text-white">Small Businesses</strong> (vendor replenishment, counter sales).
                </p>
              </div>

              {/* Architecture Stack */}
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Technical Implementation Stack
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white">FastAPI</div>
                    <div className="text-[10px] text-slate-400">REST Backend</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white">SQLAlchemy 2.0</div>
                    <div className="text-[10px] text-slate-400">Relational ORM</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white">React 19 + Motion</div>
                    <div className="text-[10px] text-slate-400">Vite & Tailwind 4</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <div className="font-bold text-slate-900 dark:text-white">RBAC Matrix</div>
                    <div className="text-[10px] text-slate-400">4-Tier Roles & Guest</div>
                  </div>
                </div>
              </div>

              {/* Academic Supervision & Team */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
                  <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Faculty Mentorship
                  </h5>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Dr. Pinki Kumari</div>
                    <div className="text-xs text-slate-500">Faculty Mentor & Project Supervisor</div>
                    <div className="text-[11px] text-slate-400">Department of Computer Science & Engineering</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Engineering Team
                  </h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-blue-600 dark:text-blue-400">Saurabh (Lead)</span>
                      <span className="font-mono text-slate-400">2501010045</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-800 dark:text-slate-200">Gargi Verma</span>
                      <span className="font-mono text-slate-400">2501010223</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-800 dark:text-slate-200">Rishita</span>
                      <span className="font-mono text-slate-400">2501010228</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-800 dark:text-slate-200">Krishyangi Dixit</span>
                      <span className="font-mono text-slate-400">2501010156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-800 dark:text-slate-200">Anveshna</span>
                      <span className="font-mono text-slate-400">2501010130</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UN SDG Impact */}
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  UN Sustainable Development Goals (SDGs)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">SDG 2: Zero Hunger</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Prevents ration waste & speeds emergency food supplies.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400">SDG 3: Health</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tracks vital first aid & essential medicines during crises.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400">SDG 8: Growth</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Empowers small retail merchants with transparent bookkeeping.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                K.R. Mangalam University · B.Tech CSE Minor Project
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
