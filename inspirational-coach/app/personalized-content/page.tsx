"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";
import Link from "next/link";
import { ArrowRight, Star, Target, BookOpen, Sparkles, MessageCircle, Copy, Save, Edit2, Trash2, RefreshCw, Share2 } from "lucide-react";

export default function PersonalizedContent() {
  // User Preferences
  const [culture, setCulture] = useState("");
  const [showCultureDropdown, setShowCultureDropdown] = useState(false);
  const [themes, setThemes] = useState<string[]>([]);
  const [tone, setTone] = useState("Motivational");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedInspirations, setSavedInspirations] = useState<any[]>([]);
  const [savingContent, setSavingContent] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState("mountains");
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

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

  // Available cultural backgrounds organized by categories
  const culturalBackgrounds = [
    {
      category: "Hispanic or Latino",
      cultures: ["Hispanic or Latino", "Mexican", "Brazilian", "Argentinian", "Colombian"]
    },
    {
      category: "American Indian or Alaska Native",
      cultures: ["Native American"]
    },
    {
      category: "Asian",
      cultures: ["Asian", "Japanese", "Chinese", "Korean", "Indian", "Filipino", "Vietnamese", "Thai"]
    },
    {
      category: "Black or African American",
      cultures: ["Black or African American", "Nigerian", "South African", "Ethiopian", "Egyptian"]
    },
    {
      category: "Native Hawaiian or Other Pacific Islander",
      cultures: ["Native Hawaiian or Other Pacific Islander", "Hawaiian", "Samoan", "Tongan"]
    },
    {
      category: "White",
      cultures: ["White", "German", "French", "Italian", "British"]
    },
    {
      category: "Middle Eastern or North African",
      cultures: ["Middle Eastern or North African", "Iranian", "Saudi Arabian", "Turkish"]
    },
    {
      category: "Indigenous Australian",
      cultures: ["Indigenous Australian"]
    }
  ];

  // Clean generated content by removing quotation marks and hashtags
  const cleanGeneratedContent = (content: string) => {
    // Remove any hashtag sequences and quotes
    return content
      .replace(/#\w+\s*/g, '')
      .replace(/^[""]|[""]$/g, '')
      .trim();
  };

  // Fetch saved inspirations
  useEffect(() => {
    const fetchSavedInspirations = async () => {
      try {
        const q = query(collection(db, "saved-inspirations"), orderBy("timestamp", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        setSavedInspirations(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
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

  // Get theme names for prompt
  const getThemeNames = () => themes.map(t => personalGrowthThemes.find(theme => theme.name === t)?.name || t);

  // Process the model response
  const processModelResponse = (response: string) => {
    const cleanedResponse = cleanGeneratedContent(response);
    return cleanedResponse;
  };

  // Fetch AI-Generated Content from FastAPI Server
  const generateContent = async () => {
    if (!culture || themes.length === 0) {
      alert("Please fill out your cultural background and select at least one theme.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/generate", {
        prompt: `You are a personal inspirational coach. Generate ONE single, cohesive inspirational message (3-4 sentences) that:

          1. Incorporates elements from ${culture} culture
          2. Focuses on the themes of ${themes}
          3. Uses a ${tone} tone
          4. Speaks directly to the reader using "you"
          5. Includes culturally relevant wisdom, proverbs, or concepts
          6. Is complete and well-structured

          Do not use bullet points or multiple options. Do not include phrases like "Here is an inspirational message." Do not label or explain the output. Simply provide the inspirational message itself, with a clear beginning and end.`,
        max_tokens: 150,
      });  
      
      console.log("Generated Content:", response.data.response);

      // Process the response to clean it up
      const processedContent = processModelResponse(response.data.response);
      setGeneratedContent(processedContent);
      setEditedContent(processedContent); // Initialize edited content with the processed response
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("Failed to generate content. Please try again.");
      setEditedContent("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save Generated Content
  const saveContent = async () => {
    if (!generatedContent) return;
    
    // Use edited content if in edit mode
    const contentToSave = isEditing ? editedContent : generatedContent;
    
    setSavingContent(true);
    try {
      const docRef = await addDoc(collection(db, "saved-inspirations"), {
        content: contentToSave,
        culture,
        themes,
        timestamp: new Date(),
        background: backgroundPreview,
      });
      
      // Add the new inspiration to the list
      setSavedInspirations([
        {
          id: docRef.id,
          content: contentToSave,
          culture,
          themes,
          timestamp: new Date(),
        },
        ...savedInspirations.slice(0, 4), // Keep only the 5 most recent
      ]);
      
      // Update content and exit edit mode
      setGeneratedContent(contentToSave);
      setIsEditing(false);
      
      // Show success feedback
      setGeneratedContent(prev => prev + "\n\n✅ Saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setSavingContent(false);
    }
  };

  // Enter edit mode
  const startEditing = () => {
    setIsEditing(true);
    // Initialize edited content with current generated content
    setEditedContent(generatedContent?.split("\n\n✅")[0] || "");
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    // Reset edited content
    setEditedContent(generatedContent?.split("\n\n✅")[0] || "");
  };

  // Apply edits
  const applyEdits = () => {
    setGeneratedContent(editedContent);
    setIsEditing(false);
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

  // Get display content (without success message)
  const getDisplayContent = () => {
    return generatedContent?.split("\n\n✅")[0] || "";
  };

  // Toggle culture dropdown
  const toggleCultureDropdown = () => {
    setShowCultureDropdown(!showCultureDropdown);
  };

  // Select culture
  const selectCulture = (selected: string) => {
    setCulture(selected);
    setShowCultureDropdown(false);
  };

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
          <Link href="/api/affirmations" className="text-gray-600 hover:text-green-500 transition flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Daily Affirmations</span>
          </Link>
          <Link href="/personalized-content" className="text-blue-600 hover:text-blue-700 transition flex items-center gap-1 font-medium">
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
      </nav>

      {/* Header Section */}
      <section className="py-10 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Personalized <span className="text-blue-600">Inspiration</span> Journey
          </h1>
          <p className="text-gray-700 mt-4 text-lg max-w-3xl mx-auto">
            Create inspiring content that resonates with your cultural background and personal growth interests.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
        {/* Left Column - Preferences */}
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="h-3 bg-blue-500"></div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Inspiration</h2>
              <p className="text-gray-700 mb-6">
                Customize your inspiration based on your background and what resonates with you.
              </p>

              {/* Cultural Background */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Your Cultural Background</label>
                <div className="relative">
                  <div 
                    onClick={toggleCultureDropdown}
                    className="w-full border border-gray-300 rounded-md p-3 bg-white text-gray-800 flex justify-between items-center cursor-pointer hover:border-blue-400 transition"
                  >
                    <span>{culture || "Select your cultural background"}</span>
                    <svg className={`h-5 w-5 text-gray-500 transition ${showCultureDropdown ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {showCultureDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                      {culturalBackgrounds.map((category) => (
                        <div key={category.category}>
                          <div className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm">
                            {category.category}
                          </div>
                          {category.cultures.map((cultureName) => (
                            <div 
                              key={cultureName}
                              onClick={() => selectCulture(cultureName)}
                              className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${culture === cultureName ? 'bg-blue-50 text-blue-600' : 'text-gray-800'}`}
                            >
                              {cultureName}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Your cultural background helps us provide more meaningful inspiration.
                </div>
              </div>

              {/* Personal Growth Themes */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Personal Growth Themes ({themes.length}/4)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {personalGrowthThemes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => toggleTheme(theme.name)}
                      disabled={themes.length >= 4 && !themes.includes(theme.name)}
                      className={`px-3 py-2 text-sm rounded-md flex items-center gap-1 transition-all duration-200 ${
                        themes.includes(theme.name) 
                          ? "bg-blue-500 text-white shadow-md" 
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
                      className={`px-4 py-3 rounded-md flex items-center justify-between transition-all duration-200 ${
                        tone === t.name 
                          ? "bg-blue-500 text-white shadow-md" 
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating your inspiration...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Inspiration</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Saved Inspirations */}
          {savedInspirations.length > 0 && (
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <div className="h-3 bg-green-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Save className="h-5 w-5 text-green-500" />
                  Your Saved Inspirations
                </h3>
                <div className="space-y-4">
                  {savedInspirations.map((insp) => (
                    <div key={insp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <p className="text-gray-800 mb-2">{insp.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div>
                          <span>{insp.culture}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(insp.timestamp.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setGeneratedContent(insp.content);
                              setEditedContent(insp.content);
                              setCulture(insp.culture);
                              setThemes(insp.themes || []);
                              if (insp.background) setBackgroundPreview(insp.background);
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                            title="Load this inspiration"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(insp.content)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteInspiration(insp.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Generated Content */}
        <div className="md:w-1/2 lg:w-3/5">
          {generatedContent ? (
            <div className="space-y-6">
              {/* Style Selection */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="h-3 bg-purple-500"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Choose Visual Style
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {backgroundOptions.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setBackgroundPreview(bg.id)}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all duration-200 ${
                          backgroundPreview === bg.id 
                            ? "border-blue-500 bg-blue-50 shadow-md" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{bg.emoji}</span>
                        <span className="text-xs text-gray-800">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inspiration Card */}
              <div className={`${getBackgroundStyle(backgroundPreview)} min-h-64 flex flex-col justify-center rounded-xl shadow-lg`}>
                <div className={`${getTextColorForBackground(backgroundPreview)} text-center px-4 py-6`}>
                  {isEditing ? (
                    <div className="flex flex-col items-center gap-4">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full p-4 text-gray-800 bg-white bg-opacity-90 rounded-lg border border-gray-300 text-lg min-h-36 shadow-inner focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                        placeholder="Edit your inspirational message here..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyEdits}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <blockquote className="text-xl font-medium italic mb-4">
                        "{getDisplayContent()}"
                      </blockquote>
                      <div className="text-sm opacity-80">
                        {themes.map((t, i) => (
                          <span key={t}>
                            {i > 0 && " • "}
                            {personalGrowthThemes.find(theme => theme.name === t)?.icon} {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => generateContent()}
                  disabled={loading || isEditing}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition flex items-center justify-center gap-2 shadow"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate</span>
                </button>
                {isEditing ? (
                  <button
                    onClick={applyEdits}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow"
                  >
                    <span>Apply Changes</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={startEditing}
                    className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2 shadow"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Content</span>
                  </button>
                )}
                <button
                  onClick={() => saveContent()}
                  disabled={savingContent || generatedContent.includes("✅ Saved") || isEditing}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition flex items-center justify-center gap-2 shadow"
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
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(getDisplayContent())}
                  disabled={isEditing}
                  className="px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300 transition shadow flex items-center gap-2"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
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