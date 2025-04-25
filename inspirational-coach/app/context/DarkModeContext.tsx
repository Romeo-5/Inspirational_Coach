"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on the client side
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Update body class for global styling
      document.body.className = darkMode ? "dark" : "";
      // Save to localStorage
      localStorage.setItem("darkMode", String(darkMode));
    }
  }, [darkMode, isLoaded]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};