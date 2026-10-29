import { useState, useEffect } from "react";
import { ThemeContext } from "./themeContextCore";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("resourceone_theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // ignore
    }
    return "light";
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("resourceone_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLight: theme === "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}
