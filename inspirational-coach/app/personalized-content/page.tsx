"use client";

import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

export default function PersonalizedContent() {
  // User Preferences
  const [culture, setCulture] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [tone, setTone] = useState("Motivational");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Available themes
  const personalGrowthThemes = [
    "Self-Discipline",
    "Creativity",
    "Confidence",
    "Mindfulness",
    "Career Growth",
    "Resilience",
    "Spirituality",
  ];

  // Handle Theme Selection
  const toggleTheme = (theme: string) => {
    setThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  // Fetch AI-Generated Content from FastAPI Server
  const generateContent = async () => {
    if (!culture || themes.length === 0) {
      alert("Please fill out your preferences first.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/generate", {
        prompt: `You are an expert inspirational coach. Your goal is to provide a deeply personalized and culturally resonant message to uplift the user.
  
        User Background:  
        - The user is from ${culture} and values ${themes.join(", ")}.
        - Their culture has unique traditions, wisdom, and perspectives that can be integrated into inspiration.
  
        Your Task: 
        - Speak directly to the user in an encouraging, motivational tone.  
        - Weave in cultural elements, such as proverbs, philosophies, or historical inspirations, that align with the user's values.  
        - Keep the message concise (2-3 sentences), impactful, and free of extra commentary.  
        - Do not restate the request or include phrases like "Here is an inspirational message:".  

        Example Output for a Japanese user who values Self-Discipline:  
        - Like the cherry blossom that blooms briefly but beautifully, your discipline defines your path. In the teachings of Bushido, perseverance is the key to self-mastery. Keep moving forward with honor, and let your dedication shape your success.

        Now, generate an inspirational message following this structure, incorporating cultural connections in a meaningful and natural way:`,
        max_tokens: 100,
      });      

      setGeneratedContent(response.data.response);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save Generated Content
  const saveContent = async () => {
    if (!generatedContent) return;

    try {
      await addDoc(collection(db, "saved-inspirations"), {
        content: generatedContent,
        culture,
        themes,
        timestamp: new Date(),
      });
      alert("Saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🌟 Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inspirational Coach</h1>
        <div className="flex space-x-6">
          <a href="/" className="text-gray-600 hover:text-blue-500">Home</a>
          <a href="/journal" className="text-gray-600 hover:text-blue-500">Journal</a>
          <a href="/api/affirmations" className="text-gray-600 hover:text-green-500">Daily Affirmations</a>
        </div>
      </nav>

      {/* 🌟 Content Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center mt-10">
        <h2 className="text-4xl font-bold text-gray-900">Personalized Inspiration</h2>
        <p className="text-gray-700 mt-4 max-w-2xl">
          Customize your inspiration feed based on your **culture, personal growth interests, and preferred tone**.
        </p>

        {/* 🔹 Preferences Form */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800">Set Your Preferences</h3>

          {/* Culture Selection */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Your Cultural Background</label>
            <input
              type="text"
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              placeholder="e.g., Japanese, African, Latin American"
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>

          {/* Personal Growth Themes Selection */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Personal Growth Themes</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {personalGrowthThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => toggleTheme(theme)}
                  className={`px-3 py-2 text-sm rounded-md ${
                    themes.includes(theme) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Preferred Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            >
              <option>Motivational</option>
              <option>Reflective</option>
              <option>Philosophical</option>
            </select>
          </div>

          {/* Generate Content Button */}
          <button
            onClick={generateContent}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            {loading ? "Generating..." : "Generate Inspiration"}
          </button>
        </div>

        {/* 📜 Generated Content Display */}
        {generatedContent && (
          <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800">Your AI-Generated Inspiration</h3>
            <p className="text-gray-700 mt-2">{generatedContent}</p>
            <button
              onClick={saveContent}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
            >
              Save to My Inspirations
            </button>
          </div>
        )}
      </main>

      {/* 🌟 Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-6">
        <p className="text-gray-600">© 2025 Inspirational Coach. All rights reserved.</p>
      </footer>
    </div>
  );
}
