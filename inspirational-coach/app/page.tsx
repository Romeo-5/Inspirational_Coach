import AuthButtons from "./components/AuthButtons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🌟 Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inspirational Coach</h1>
        <div className="flex space-x-6">
          <Link href="/journal" className="text-gray-600 hover:text-blue-500">
            Journal
          </Link>
          <Link href="/api/affirmations" className="text-gray-600 hover:text-green-500">
            Daily Affirmations
          </Link>
          <Link href="/personalized-content" className="text-gray-600 hover:text-purple-500">
            Personalized Inspiration
          </Link>
          <Link href="/goals" className="text-gray-600 hover:text-orange-500">
            Goal Tracking
          </Link>
          <Link href="/feedback" className="text-gray-600 hover:text-purple-500">
            Feedback
          </Link>
        </div>
        <AuthButtons />
      </nav>

      {/* 🌟 Home Page Body */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mt-10">
          Unlock Your Potential
        </h2>
        <p className="text-gray-700 mt-4 max-w-2xl">
          Inspirational Coach helps you stay motivated with <b>daily affirmations, personalized goal setting, and guided journaling</b>.
          Join a community that uplifts and inspires!
        </p>

        {/* Features Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature: Goal Setting */}
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">📌 Goal Setting</h3>
            <p className="text-gray-600 mt-2">
              Define and track your personal goals with progress visualization.
            </p>
            <Link href="/goals">
              <button className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-md shadow-md hover:bg-orange-600">
                Track Goals
              </button>
            </Link>
          </div>

          {/* Feature: Daily Affirmations */}
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">🌟 Daily Affirmations</h3>
            <p className="text-gray-600 mt-2">
              Get a daily boost with positive affirmations tailored to your mindset.
            </p>
          </div>

          {/* Feature: Personalized Inspiration */}
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">💡 Personalized Inspiration</h3>
            <p className="text-gray-600 mt-2">
              AI-powered inspiration tailored to your background, values, and goals.
            </p>
            <Link href="/personalized-content">
              <button className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-md shadow-md hover:bg-purple-600">
                Explore Now
              </button>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10">
          <Link href="/journal">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
              Start Your Journey
            </button>
          </Link>
        </div>
      </main>

      {/* 🌟 Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-6">
        <p className="text-gray-600">© 2025 Inspirational Coach. All rights reserved.</p>
      </footer>
    </div>
  );
}
