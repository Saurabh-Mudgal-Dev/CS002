import React from "react";
import {
  HeartHandshake,
  Store,
  ShieldCheck,
  BellDot,
  Info,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({
  contextMode,
  setContextMode,
  userRole,
  setUserRole,
  lowStockCount = 0,
  backendStatus = "healthy",
  onOpenAbout,
  onViewAlerts
}) {
  const isNGO = contextMode === "ngo";
  const isConnected = backendStatus === "healthy";
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-2xl px-4 sm:px-6 py-3 transition-colors shadow-xl"
      style={{
        background: isLight ? "rgba(251, 248, 243, 0.95)" : "rgba(7, 5, 3, 0.95)",
        borderColor: "var(--border-subtle)"
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Brand Identity */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div
              
              
              className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#c68b3a] via-[#e8a722] to-[#f5c842] p-[1.5px] shadow-lg shadow-[#f5c842]/20 flex items-center justify-center cursor-pointer"
            >
              <div
                className="h-full w-full rounded-[14px] flex items-center justify-center"
                style={{ background: isLight ? "#ffffff" : "#0d0a08", color: "var(--accent)" }}
              >
                
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
                  ResourceOne
                </span>
                <span
                  className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1"
                  style={{
                    background: "var(--badge-bg)",
                    color: "var(--badge-text)",
                    borderColor: "var(--badge-border)"
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  SaaS Platform
                </span>
              </div>
              <p className="text-[11px] hidden sm:block font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                Smart Inventory & Resource Operations
              </p>
            </div>
          </div>

          {/* Backend dot (mobile) */}
          <div className="flex md:hidden items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {isConnected ? "Live" : "Local"}
            </span>
          </div>
        </div>

        {/* Context Switcher â€” NGO vs Retail */}
        <div
          className="flex items-center p-1 rounded-2xl border shadow-inner"
          style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setContextMode("ngo")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              isNGO
                ? "bg-gradient-to-r from-[#f5c842] to-[#e8a722] text-[#0d0900] shadow-md shadow-[#f5c842]/20 font-extrabold"
                : "hover:bg-black/5"
            }`}
            style={!isNGO ? { color: "var(--text-muted)" } : {}}
            title="Community NGO / Disaster Relief Mode"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>NGO Relief</span>
          </button>

          <button
            onClick={() => setContextMode("retail")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              !isNGO
                ? "bg-gradient-to-r from-[#c68b3a] to-[#9c6430] text-white shadow-md shadow-[#c68b3a]/20 font-extrabold"
                : "hover:bg-black/5"
            }`}
            style={isNGO ? { color: "var(--text-muted)" } : {}}
            title="Small Business / Retail Shopkeeper Mode"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Small Business</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">

          {/* Theme Toggle Button */}
          <button
            
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border transition-colors cursor-pointer"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: isLight ? "#d97706" : "#f5c842"
            }}
            title={isLight ? "Switch to Dark  Mode" : "Switch to Warm  Light Mode"}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Role Switcher */}
          <div
            className="flex items-center gap-2 border rounded-xl px-3 py-2 text-xs"
            style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)" }} />
            <span className="hidden sm:inline font-semibold" style={{ color: "var(--text-muted)" }}>Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs"
              style={{ color: "var(--text-primary)" }}
            >
              <option value="Admin" className="bg-[#141009] text-white">Administrator</option>
              <option value="Manager" className="bg-[#141009] text-white">Inv. Manager</option>
              <option value="Volunteer" className="bg-[#141009] text-white">
                {isNGO ? "Relief Volunteer" : "Sales Clerk"}
              </option>
            </select>
          </div>

          {/* Low Stock Bell */}
          <button
            
            onClick={onViewAlerts}
            className="relative p-2.5 rounded-xl border transition-colors cursor-pointer"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: lowStockCount > 0 ? "var(--accent)" : "var(--text-muted)"
            }}
            title="Low-Stock Warnings"
          >
            <BellDot className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#f5c842] text-[9px] font-black text-[#0d0900] shadow-lg animate-pulse px-1">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Backend Status (Desktop) */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-xs"
            style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 shadow-sm shadow-emerald-500/60" : "bg-amber-400"}`} />
            <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
              {isConnected ? "FastAPI :8000" : "Local Mode"}
            </span>
          </div>

          {/* About Button */}
          <button
            
            onClick={onOpenAbout}
            className="p-2.5 rounded-xl border transition-colors cursor-pointer"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-muted)"
            }}
            title="System Specifications & Architecture"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}

