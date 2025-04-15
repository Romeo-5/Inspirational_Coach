import AuthButtons from "./components/AuthButtons";
import Link from "next/link";
import { ArrowRight, Star, Target, BookOpen, Sparkles, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <Link href="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-500" />
          <span>Inspirational Coach</span>
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/journal" className="text-gray-600 hover:text-blue-500 transition flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>Journal</span>
          </Link>
          <Link href="/affirmations" className="text-gray-600 hover:text-green-500 transition flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Daily Affirmations</span>
          </Link>
          <Link href="/personalized-content" className="text-gray-600 hover:text-purple-500 transition flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Personalized Inspiration</span>
          </Link>
          <Link href="/goals" className="text-gray-600 hover:text-orange-500 transition flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Goal Tracking</span>
          </Link>
          <Link href="/feedback" className="text-gray-600 hover:text-purple-500 transition flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>Feedback</span>
          </Link>
        </div>
        
        {/* Mobile menu button (simplified) */}
        <button className="md:hidden text-gray-600 focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="hidden md:block">
          <AuthButtons />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-left md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Elevate Your <span className="text-blue-600">Journey</span> of Personal Growth
            </h1>
            <p className="text-gray-700 mt-6 text-lg">
              Discover a more fulfilled life with daily affirmations, personalized goal setting, and guided journaling. 
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/journal">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/personalized-content">
                <button className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 transition">
                  Explore Features
                </button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-lg">
                <h3 className="text-xl font-medium">Today's Inspiration</h3>
                <p className="mt-4 text-lg italic">"The journey of a thousand miles begins with a single step. Today is your day to take that step with courage and conviction."</p>
                <div className="mt-4 text-blue-100 text-sm">Tap to refresh</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tools for Your Personal Growth Journey
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature: Goal Setting */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all hover:shadow-xl">
              <div className="h-3 bg-orange-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Goal Setting</h3>
                <p className="text-gray-600 mt-3">
                  Define clear objectives, track your progress, and celebrate milestones along your personal growth journey.
                </p>
                <Link href="/goals">
                  <button className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-md shadow hover:bg-orange-600 transition flex items-center gap-2">
                    <span>Track Goals</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Feature: Daily Affirmations */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all hover:shadow-xl">
              <div className="h-3 bg-green-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Daily Affirmations</h3>
                <p className="text-gray-600 mt-3">
                  Start each day with positive affirmations tailored to your mindset and current challenges.
                </p>
                <Link href="/api/affirmations">
                  <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition flex items-center gap-2">
                    <span>Get Inspired</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Feature: Personalized Inspiration */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all hover:shadow-xl">
              <div className="h-3 bg-purple-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Personalized Inspiration</h3>
                <p className="text-gray-600 mt-3">
                  Receive AI-powered inspiration that resonates with your cultural background, values, and personal goals.
                </p>
                <Link href="/personalized-content">
                  <button className="mt-6 px-4 py-2 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600 transition flex items-center gap-2">
                    <span>Explore Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span>Inspirational Coach</span>
              </h3>
              <p className="text-gray-400 max-w-md">
                Empowering individuals to achieve personal growth through inspiration, goal setting, and daily practice.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Inspirational Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}