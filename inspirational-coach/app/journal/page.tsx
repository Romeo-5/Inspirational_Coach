"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { Calendar, Moon, Sun, Sparkles, Save, Trash, Edit, X, RefreshCw, Search, Filter, ChevronDown } from "lucide-react";

export default function Journal() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<{ id: string; entry: string; timestamp: any; mood?: string; tags?: string[] }[]>([]);
  const [prompt, setPrompt] = useState("");
  const [activePrompt, setActivePrompt] = useState(false);
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const entryRef = useRef<HTMLTextAreaElement>(null);

  // 🔹 List of guided prompts for journaling
  const prompts = [
    "What made you smile today?",
    "What are you grateful for?",
    "What challenge did you overcome recently?",
    "Describe a moment when you felt truly inspired.",
    "How do you want to improve yourself this week?",
    "What is one thing you learned today?",
    "Write about a small joy you experienced recently.",
    "What's something you're looking forward to?",
    "Reflect on a relationship that's important to you.",
    "What self-care activities did you practice today?",
  ];

  // 🔹 Mood options
  const moodOptions = [
    { value: "happy", label: "Happy 😊" },
    { value: "calm", label: "Calm 😌" },
    { value: "motivated", label: "Motivated 💪" },
    { value: "reflective", label: "Reflective 🤔" },
    { value: "tired", label: "Tired 😴" },
    { value: "anxious", label: "Anxious 😰" },
    { value: "grateful", label: "Grateful 🙏" },
  ];

  // 🔹 Dark mode toggle
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // 🔹 Fetch saved journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      const q = query(collection(db, "journal-entries"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      setEntries(querySnapshot.docs.map((doc) => ({
        id: doc.id,
        entry: doc.data().entry,
        timestamp: doc.data().timestamp,
        mood: doc.data().mood || "",
        tags: doc.data().tags || [],
      })));
    };
    fetchEntries();
  }, []);

  // 🔹 Add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // 🔹 Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 🔹 Save a new journal entry
  const saveEntry = async () => {
    if (entry.trim() === "") return;
    
    if (editingId) {
      // Update existing entry
      await updateDoc(doc(db, "journal-entries", editingId), {
        entry,
        mood,
        tags,
        lastEdited: new Date(),
      });
      setEditingId(null);
    } else {
      // Add new entry
      await addDoc(collection(db, "journal-entries"), {
        entry,
        timestamp: new Date(),
        mood,
        tags,
      });
    }
    
    // Refresh entries
    const q = query(collection(db, "journal-entries"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    setEntries(querySnapshot.docs.map((doc) => ({
      id: doc.id,
      entry: doc.data().entry,
      timestamp: doc.data().timestamp,
      mood: doc.data().mood || "",
      tags: doc.data().tags || [],
    })));
    
    // Reset form
    setEntry("");
    setMood("");
    setTags([]);
    setActivePrompt(false);
  };

  // 🔹 Delete an entry
  const deleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteDoc(doc(db, "journal-entries", id));
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  // 🔹 Edit an entry
  const editEntry = (id: string) => {
    const entryToEdit = entries.find(e => e.id === id);
    if (entryToEdit) {
      setEntry(entryToEdit.entry);
      setMood(entryToEdit.mood || "");
      setTags(entryToEdit.tags || []);
      setEditingId(id);
      
      // Scroll to and focus the textarea
      if (entryRef.current) {
        entryRef.current.focus();
        entryRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // 🔹 Generate a new guided prompt
  const generatePrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(randomPrompt);
    setActivePrompt(true);
  };

  // 🔹 Apply prompt to entry
  const applyPrompt = () => {
    setEntry(prompt + "\n\n");
    if (entryRef.current) {
      entryRef.current.focus();
    }
  };

  // 🔹 Filter entries by search and filter
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.entry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (filter === "all") return matchesSearch;
    if (filter === "mood" && entry.mood === mood) return matchesSearch;
    if (filter === "today") {
      const today = new Date();
      const entryDate = new Date(entry.timestamp.seconds * 1000);
      return matchesSearch && 
             today.getDate() === entryDate.getDate() &&
             today.getMonth() === entryDate.getMonth() &&
             today.getFullYear() === entryDate.getFullYear();
    }
    return matchesSearch;
  });

  // 🔹 Get date for grouping
  const getEntryDate = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 🔹 Group entries by date
  const groupedEntries = filteredEntries.reduce((groups: any, entry) => {
    const date = getEntryDate(entry.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"} transition-colors duration-300`}>
      {/* 🌟 Navigation Bar */}
      <nav className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-10`}>
        <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} flex items-center`}>
          <Sparkles className="mr-2" size={20} />
          Inspirational Coach
        </h1>
        <div className="flex items-center space-x-6">
          <Link href="/" className={`${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-500"} transition-colors`}>
            Home
          </Link>
          <Link href="/api/affirmations" className={`${darkMode ? "text-gray-300 hover:text-green-400" : "text-gray-600 hover:text-green-500"} transition-colors`}>
            Daily Affirmations
          </Link>
          <Link href="/feedback" className={`${darkMode ? "text-gray-300 hover:text-purple-400" : "text-gray-600 hover:text-purple-500"} transition-colors`}>
            Feedback
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* 🌟 Journal Section */}
      <main className="flex flex-col items-center justify-start flex-grow px-6 py-10 max-w-7xl mx-auto w-full">
        <h2 className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>Guided Journaling</h2>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-8 max-w-2xl text-center`}>
          Reflect, express, and grow. Track your moods, tag your entries, and explore your journey over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* 📝 Left Column: Write & Edit */}
          <div className="lg:col-span-2 space-y-6">
            {/* 📌 Guided Prompt Generator */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-lg p-6 border`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  Need inspiration?
                </h3>
                <button
                  onClick={generatePrompt}
                  className={`px-3 py-1 ${darkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg shadow-sm flex items-center`}
                >
                  <RefreshCw size={16} className="mr-1" />
                  New Prompt
                </button>
              </div>
              
              {prompt && (
                <div className={`${darkMode ? "bg-gray-700" : "bg-blue-50"} p-4 rounded-lg mb-3`}>
                  <p className={`${darkMode ? "text-gray-200" : "text-gray-700"} italic`}>{prompt}</p>
                  {activePrompt && (
                    <button
                      onClick={applyPrompt}
                      className={`mt-2 px-3 py-1 ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-blue-100 hover:bg-blue-200"} text-sm rounded flex items-center`}
                    >
                      Use this prompt
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ✍️ Journal Input */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-lg p-6 border`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {editingId ? "Edit Entry" : "Write New Entry"}
                </h3>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEntry("");
                      setMood("");
                      setTags([]);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <textarea
                ref={entryRef}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Write your thoughts here..."
                className={`w-full h-48 border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-700"} rounded-md p-4 focus:outline-none focus:ring-2 ${darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"}`}
              />
              
              {/* 🌈 Mood Selector */}
              <div className="mt-4">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMood(option.value)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        mood === option.value
                          ? darkMode
                            ? "bg-indigo-600 text-white"
                            : "bg-blue-500 text-white"
                          : darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 🏷️ Tags Input */}
              <div className="mt-4">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  Add tags
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add a tag and press Enter"
                    className={`flex-grow border ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} rounded-md p-2 focus:outline-none focus:ring-1 ${darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"}`}
                  />
                  <button
                    onClick={addTag}
                    className={`ml-2 px-3 py-2 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} rounded-md`}
                  >
                    Add
                  </button>
                </div>
                
                {/* Display tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center px-2 py-1 rounded-full text-sm ${
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={saveEntry}
                className={`mt-4 px-6 py-2 ${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white rounded-lg shadow-md flex items-center justify-center`}
              >
                <Save size={18} className="mr-2" />
                {editingId ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </div>

          {/* 📜 Right Column: Previous Entries */}
          <div className="space-y-6">
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-lg p-6 border`}>
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>Journal Entries</h3>
              
              {/* 🔍 Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className={`flex items-center border ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"} rounded-lg overflow-hidden`}>
                  <div className={`p-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search entries or tags..."
                    className={`flex-grow p-2 ${darkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white"} focus:outline-none`}
                  />
                </div>
                
                <div className="flex items-center">
                  <Filter size={16} className={`mr-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`py-1 px-2 ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-700 border-gray-300"} border rounded-md focus:outline-none focus:ring-1 ${darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"}`}
                  >
                    <option value="all">All entries</option>
                    <option value="today">Today only</option>
                    <option value="mood">By current mood</option>
                  </select>
                </div>
              </div>
              
              {/* 📅 Entries by Date */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {Object.keys(groupedEntries).length > 0 ? (
                  Object.entries(groupedEntries).map(([date, entriesForDate]: [string, any]) => (
                    <div key={date} className="space-y-3">
                      <div className={`flex items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        <Calendar size={16} className="mr-2" />
                        <h4 className="font-medium">{date}</h4>
                      </div>
                      
                      {entriesForDate.map((item: any) => (
                        <div 
                          key={item.id} 
                          className={`${darkMode ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"} p-4 rounded-lg transition-colors`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            {item.mood && (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                darkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700"
                              }`}>
                                {moodOptions.find(m => m.value === item.mood)?.label || item.mood}
                              </span>
                            )}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editEntry(item.id)}
                                className={`text-sm ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600"}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteEntry(item.id)}
                                className="text-sm text-red-500 hover:text-red-600"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}>
                            {item.entry.length > 150 
                              ? `${item.entry.substring(0, 150)}...` 
                              : item.entry}
                          </p>
                          
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map((tag: string, idx: number) => (
                                <span 
                                  key={idx} 
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-2`}>
                            {new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-center py-6 italic`}>
                    {entries.length === 0 
                      ? "No journal entries yet. Start writing!" 
                      : "No entries match your search or filter."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 🌟 Footer */}
      <footer className={`${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-600"} text-center py-4 mt-auto`}>
        <p>© 2025 Inspirational Coach. All rights reserved.</p>
      </footer>
    </div>
  );
}