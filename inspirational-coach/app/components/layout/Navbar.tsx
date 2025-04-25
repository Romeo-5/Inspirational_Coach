"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDarkMode } from "../../context/DarkModeContext";
import { Sparkles, BookOpen, Star, Target, MessageCircle, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getNavItemClasses = (path: string) => {
    const baseClasses = "transition flex items-center gap-1";
    
    if (isActive(path)) {
      return `${baseClasses} ${darkMode ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-blue-600 border-b-2 border-blue-500 pb-1"}`;
    }
    
    return `${baseClasses} ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-500"}`;
  };

  return (
    <nav className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-10`}>
      <Link href="/" className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
        <Sparkles className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-500"}`} />
        <span>Inspirational Coach</span>
      </Link>
      
      <div className="hidden md:flex space-x-6">
        <Link href="/journal" className={getNavItemClasses("/journal")}>
          <BookOpen className="h-4 w-4" />
          <span>Journal</span>
        </Link>
        <Link href="/personalized-content" className={getNavItemClasses("/personalized-content")}>
          <Sparkles className="h-4 w-4" />
          <span>Personalized Inspiration</span>
        </Link>
        <Link href="/affirmations" className={getNavItemClasses("/affirmations")}>
          <Star className="h-4 w-4" />
          <span>Daily Affirmations</span>
        </Link>
        <Link href="/goals" className={getNavItemClasses("/goals")}>
          <Target className="h-4 w-4" />
          <span>Goal Tracking</span>
        </Link>
        <Link href="/feedback" className={getNavItemClasses("/feedback")}>
          <MessageCircle className="h-4 w-4" />
          <span>Feedback</span>
        </Link>
        
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"}`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      
      {/* Mobile menu button (simplified) */}
      <button className="md:hidden text-gray-600 focus:outline-none">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  );
}