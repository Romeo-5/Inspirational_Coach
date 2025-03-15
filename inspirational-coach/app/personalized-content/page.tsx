"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";
import Link from "next/link";

interface SavedInspiration {
  id: string;
  content: string;
  culture: string;
  themes: string[];
  timestamp: any;
}

export default function PersonalizedContent() {
  // User Preferences
  const [culture, setCulture] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [tone, setTone] = useState("Motivational");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedInspirations, setSavedInspirations] = useState<SavedInspiration[]>([]);
  const [savingContent, setSavingContent] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState("mountains");

  // Available themes with icons
  const personalGrowthThemes = [
    { name: "Self-Discipline", icon: "🧠" },
    { name: "Creativity", icon: "🎨" },
    { name: "Confidence", icon: "💪" },
    { name: "Mindfulness", icon: "🧘‍♀️" },
    { name: "Career Growth", icon: "📈" },
    { name: "Resilience", icon: "🛡️" },
    { name: "Spirituality", icon: "✨" },
    { name: "Leadership", icon: "👑" },
    { name: "Wellness", icon: "🌿" },
    { name: "Gratitude", icon: "🙏" },
  ];

  // Available tones with descriptions
  const tones = [
    { name: "Motivational", description: "Uplifting and energizing", icon: "🔥" },
    { name: "Reflective", description: "Thoughtful and contemplative", icon: "🌊" },
    { name: "Philosophical", description: "Deep and thought-provoking", icon: "💭" },
    { name: "Practical", description: "Actionable and concrete", icon: "🛠️" },
    { name: "Poetic", description: "Lyrical and expressive", icon: "🎭" },
  ];

  // Background options
  const backgroundOptions = [
    { id: "mountains", name: "Mountains", emoji: "🏔️" },
    { id: "ocean", name: "Ocean", emoji: "🌊" },
    { id: "forest", name: "Forest", emoji: "🌲" },
    { id: "stars", name: "Stars", emoji: "✨" },
    { id: "sunset", name: "Sunset", emoji: "🌅" },
    { id: "minimalist", name: "Minimalist", emoji: "◻️" },
  ];

  // Fetch saved inspirations
  useEffect(() => {
    const fetchSavedInspirations = async () => {
      try {
        const q = query(collection(db, "saved-inspirations"), orderBy("timestamp", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        setSavedInspirations(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<SavedInspiration, "id">),
          }))
        );
      } catch (error) {
        console.error("Error fetching saved inspirations:", error);
      }
    };

    fetchSavedInspirations();
  }, []);

  // Handle Theme Selection
  const toggleTheme = (theme: string) => {
    setThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  // Get popular cultural backgrounds suggestions
  const popularCultures = [
    "Japanese", "Indian", "African", "Latin American", 
    "Nordic", "Middle Eastern", "Chinese", "Mediterranean"
  ];

  // Get theme names for prompt
  const getThemeNames = () => themes.map(t => personalGrowthThemes.find(theme => theme.name === t)?.name || t);

  // Fetch AI-Generated Content from FastAPI Server
  const generateContent = async () => {
    if (!culture || themes.length === 0) {
      alert("Please fill out your cultural background and select at least one theme.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/generate", {
        prompt: `You are a personal inspirational coach. Generate ONE single, cohesive inspirational message (3-4 sentences) that:

          1. Incorporates elements from {culture} culture
          2. Focuses on the themes of {themes}
          3. Uses a {tone} tone
          4. Speaks directly to the reader using "you"
          5. Includes culturally relevant wisdom, proverbs, or concepts
          6. Is complete and well-structured

          Do not use bullet points or multiple options. Do not include phrases like "Here is an inspirational message." Do not label or explain the output. Simply provide the inspirational message itself, with a clear beginning and end.

          Example format for Japanese culture and Self-Discipline theme:
          Like the cherry blossom that blooms briefly but beautifully, your discipline defines your path. In the teachings of Bushido, perseverance is the key to self-mastery. Keep moving forward with honor, and let your dedication shape your success.`,
        max_tokens: 150,
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
    
    setSavingContent(true);
    try {
      const docRef = await addDoc(collection(db, "saved-inspirations"), {
        content: generatedContent,
        culture,
        themes,
        timestamp: new Date(),
        background: backgroundPreview,
      });
      
      // Add the new inspiration to the list
      setSavedInspirations([
        {
          id: docRef.id,
          content: generatedContent,
          culture,
          themes,
          timestamp: new Date(),
        },
        ...savedInspirations.slice(0, 4), // Keep only the 5 most recent
      ]);
      
      // Show success feedback
      setGeneratedContent(prev => prev + "\n\n✅ Saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setSavingContent(false);
    }
  };

  // Delete saved inspiration
  const deleteInspiration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inspiration?")) return;
    
    try {
      await deleteDoc(doc(db, "saved-inspirations", id));
      setSavedInspirations(prev => prev.filter(insp => insp.id !== id));
    } catch (error) {
      console.error("Error deleting inspiration:", error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Get background style
  const getBackgroundStyle = (background: string) => {
    const baseStyle = "bg-gradient-to-br from-opacity-80 to-opacity-70 p-6 rounded-lg shadow-lg";
    
    switch(background) {
      case "mountains":
        return `${baseStyle} from-blue-600 to-purple-700`;
      case "ocean":
        return `${baseStyle} from-blue-400 to-teal-600`;
      case "forest":
        return `${baseStyle} from-green-500 to-emerald-700`;
      case "stars":
        return `${baseStyle} from-indigo-800 to-purple-900`;
      case "sunset":
        return `${baseStyle} from-orange-400 to-pink-600`;
      case "minimalist":
      default:
        return `${baseStyle} from-gray-100 to-gray-200`;
    }
  };

  // Get text color for background
  const getTextColorForBackground = (background: string) => {
    return ["minimalist"].includes(background) ? "text-gray-800" : "text-white";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <Link href="/" className="text-2xl font-bold text-gray-800">Inspirational Coach</Link>
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-500 transition">Home</Link>
          <Link href="/goals" className="text-gray-600 hover:text-blue-500 transition">Goals</Link>
          <Link href="/journal" className="text-gray-600 hover:text-blue-500 transition">Journal</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left Column - Preferences */}
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personalized Inspiration</h2>
            <p className="text-gray-700 mb-6">
              Create inspiring content that resonates with your cultural background and personal growth interests.
            </p>

            {/* Cultural Background */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Your Cultural Background</label>
              <input
                type="text"
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                placeholder="e.g., Japanese, African, Latin American"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
              />
              
              {/* Popular culture suggestions */}
              <div className="mt-2 flex flex-wrap gap-2">
                {popularCultures.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCulture(c)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Growth Themes */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Personal Growth Themes ({themes.length}/4)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {personalGrowthThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => toggleTheme(theme.name)}
                    disabled={themes.length >= 4 && !themes.includes(theme.name)}
                    className={`px-3 py-2 text-sm rounded-md flex items-center gap-1 transition ${
                      themes.includes(theme.name) 
                        ? "bg-blue-500 text-white" 
                        : themes.length >= 4 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Preferred Tone</label>
              <div className="grid grid-cols-1 gap-2">
                {tones.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTone(t.name)}
                    className={`px-4 py-3 rounded-md flex items-center justify-between transition ${
                      tone === t.name 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{t.icon}</span>
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <span className="text-xs opacity-80">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateContent}
              disabled={loading || !culture || themes.length === 0}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:bg-blue-300 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating your inspiration...</span>
                </>
              ) : (
                <>
                  <span>Generate Inspiration</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Inspirations */}
          {savedInspirations.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Saved Inspirations</h3>
              <div className="space-y-4">
                {savedInspirations.map((insp) => (
                  <div key={insp.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">{insp.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        <span>{insp.culture}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(insp.timestamp.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(insp.content)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteInspiration(insp.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Generated Content */}
        <div className="md:w-1/2 lg:w-3/5">
          {generatedContent ? (
            <div className="space-y-6">
              {/* Style Selection */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Visual Style</h3>
                <div className="grid grid-cols-3 gap-3">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBackgroundPreview(bg.id)}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                        backgroundPreview === bg.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{bg.emoji}</span>
                      <span className="text-xs">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspiration Card */}
              <div className={`${getBackgroundStyle(backgroundPreview)} min-h-64 flex flex-col justify-center`}>
                <div className={`${getTextColorForBackground(backgroundPreview)} text-center px-4 py-6`}>
                  <blockquote className="text-xl font-medium italic mb-4">
                    "{generatedContent.split("\n\n✅")[0]}"
                  </blockquote>
                  <div className="text-sm opacity-80">
                    {themes.map((t, i) => (
                      <span key={t}>
                        {i > 0 && " • "}
                        {personalGrowthThemes.find(theme => theme.name === t)?.icon} {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => generateContent()}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                  <span>Regenerate</span>
                  <span>🔄</span>
                </button>
                <button
                  onClick={() => saveContent()}
                  disabled={savingContent || generatedContent.includes("✅ Saved")}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition flex items-center justify-center gap-2"
                >
                  {savingContent ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : generatedContent.includes("✅ Saved") ? (
                    <>
                      <span>Saved</span>
                      <span>✅</span>
                    </>
                  ) : (
                    <>
                      <span>Save Inspiration</span>
                      <span>💾</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(generatedContent.split("\n\n✅")[0])}
                  className="px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>

              {/* Share Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Share Your Inspiration</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2">
                    <span>Facebook</span>
                  </button>
                  <button className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition flex items-center gap-2">
                    <span>Twitter</span>
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-2">
                    <span>WhatsApp</span>
                  </button>
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition flex items-center gap-2">
                    <span>Instagram</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
              <div className="text-9xl mb-6">✨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Your Personalized Inspiration</h3>
              <p className="text-gray-600 max-w-md mb-6">
                Fill out your preferences and click "Generate Inspiration" to receive culturally relevant wisdom tailored to your personal growth journey.
              </p>
              <div className="flex flex-col gap-2 text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">1</div>
                  <span>Select your cultural background</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">2</div>
                  <span>Choose personal growth themes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">3</div>
                  <span>Pick your preferred tone</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 mt-auto border-t border-gray-200">
        <p className="text-gray-600">© 2025 Inspirational Coach. All rights reserved.</p>
      </footer>
    </div>
  );
}