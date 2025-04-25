"use client";

import { ReactNode } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  pageHeader?: ReactNode;
}

export default function PageLayout({ children, pageHeader }: PageLayoutProps) {
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode 
        ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white" 
        : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900"
    }`}>
      <Navbar />
      
      {/* Optional page-specific header */}
      {pageHeader && pageHeader}
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}