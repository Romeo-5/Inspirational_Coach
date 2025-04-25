"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDarkMode } from "../../context/DarkModeContext";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  icon?: ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  gradientFrom, 
  gradientTo,
  icon 
}: PageHeaderProps) {
  const { darkMode } = useDarkMode();
  
  // Adjust gradient colors based on dark mode
  const getDarkModeGradient = (color: string) => {
    // Make gradients darker in dark mode
    if (darkMode) {
      if (color.includes('blue')) return color.replace('blue', 'blue-900');
      if (color.includes('purple')) return color.replace('purple', 'purple-900');
      if (color.includes('green')) return color.replace('green', 'green-900');
      if (color.includes('orange')) return color.replace('orange', 'orange-900');
      if (color.includes('red')) return color.replace('red', 'red-900');
      if (color.includes('yellow')) return color.replace('yellow', 'yellow-900');
      return color;
    }
    return color;
  };

  const bgGradient = darkMode 
    ? `bg-gradient-to-r from-${getDarkModeGradient(gradientFrom)} to-${getDarkModeGradient(gradientTo)}`
    : `bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`;

  return (
    <header className={`${bgGradient} text-white py-12 px-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="text-white/90 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {icon && <div className="text-white">{icon}</div>}
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
        </div>
        <p className={`mt-4 ${darkMode ? "text-gray-200" : "text-white/80"} max-w-2xl`}>
          {description}
        </p>
      </div>
    </header>
  );
}