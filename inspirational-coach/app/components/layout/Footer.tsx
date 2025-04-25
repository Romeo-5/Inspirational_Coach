"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useDarkMode } from "../../context/DarkModeContext";

export default function Footer() {
  const { darkMode } = useDarkMode();

  return (
    <footer className={`${
      darkMode ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-gray-100 text-gray-600 border-gray-200"
    } py-12 px-6 mt-auto`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span className={darkMode ? "text-white" : "text-gray-800"}>Inspirational Coach</span>
            </h3>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} max-w-md`}>
              Empowering individuals to achieve personal growth through inspiration, goal setting, and daily practice.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} uppercase tracking-wider mb-4`}>Features</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/journal" className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"} transition`}>
                    Journal
                  </Link>
                </li>
                <li>
                  <Link href="/goals" className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"} transition`}>
                    Goal Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/affirmations" className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"} transition`}>
                    Daily Affirmations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"} uppercase tracking-wider mb-4`}>Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/personalized-content" className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"} transition`}>
                    Personalized Inspiration
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} mt-12 pt-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p>© 2025 Inspirational Coach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}