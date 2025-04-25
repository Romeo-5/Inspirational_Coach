"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { useDarkMode } from "../context/DarkModeContext";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { 
  Calendar, Sparkles, Save, Trash, Edit, X, RefreshCw, 
  Search, Filter, BookOpen, Copy
} from "lucide-react";

export default function Journal() {
  const { user, loading: userLoading } = useUser();
  const { darkMode } = useDarkMode();
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
  const [isLoading, setIsLoading] = useState(false);
  const entryRef = useRef<HTMLTextAreaElement>(null);

  // List of guided prompts for journaling
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

  // Mood options
  const moodOptions = [
    { value: "happy", label: "Happy 😊" },
    { value: "calm", label: "Calm 😌" },
    { value: "motivated", label: "Motivated 💪" },
    { value: "reflective", label: "Reflective 🤔" },
    { value: "tired", label: "Tired 😴" },
    { value: "anxious", label: "Anxious 😰" },
    { value: "grateful", label: "Grateful 🙏" },
  ];

  // Fetch saved journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setEntries([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Add where clause to filter by user ID
        const q = query(
          collection(db, "journal-entries"), 
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        setEntries(querySnapshot.docs.map((doc) => ({
          id: doc.id,
          entry: doc.data().entry,
          timestamp: doc.data().timestamp,
          mood: doc.data().mood || "",
          tags: doc.data().tags || [],
        })));
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, [user]);

  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Save a new journal entry
  const saveEntry = async () => {
    if (entry.trim() === "" || !user) return;
    
    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing entry
        await updateDoc(doc(db, "journal-entries", editingId), {
          entry,
          mood,
          tags,
          lastEdited: new Date(),
          // userId already exists on the document
        });
        setEditingId(null);
      } else {
        // Add new entry with userId
        await addDoc(collection(db, "journal-entries"), {
          entry,
          timestamp: new Date(),
          mood,
          tags,
          userId: user.uid,  // Include the user ID
        });
      }
      
      // Refresh entries
      const q = query(
        collection(db, "journal-entries"), 
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      
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
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an entry
  const deleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteDoc(doc(db, "journal-entries", id));
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  // Edit an entry
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

  // Generate a new guided prompt
  const generatePrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(randomPrompt);
    setActivePrompt(true);
  };

  // Apply prompt to entry
  const applyPrompt = () => {
    setEntry(prompt + "\n\n");
    if (entryRef.current) {
      entryRef.current.focus();
    }
  };

  // Filter entries by search and filter
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

  // Get date for grouping
  const getEntryDate = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups: any, entry) => {
    const date = getEntryDate(entry.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  // Copy entry to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Create the page header
  const journalHeader = (
    <PageHeader
      title="Guided Journaling Journey"
      description="Reflect, express, and grow. Track your moods, tag your entries, and explore your journey over time."
      gradientFrom="blue-500"
      gradientTo="indigo-600"
      icon={<BookOpen size={24} />}
    />
  );

  // Add a login prompt for unauthenticated users
  if (userLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin h-8 w-8 border-4 ${darkMode ? "border-blue-400 border-t-transparent" : "border-blue-500 border-t-transparent"} rounded-full`}></div>
          <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Loading...</span>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}>
            <BookOpen className={`h-12 w-12 ${darkMode ? "text-blue-400" : "text-blue-500"} mx-auto mb-4`} />
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>Sign In Required</h1>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
              Please sign in to access your personal journal and start recording your thoughts.
            </p>
            <Link href="/">
              <button className={`px-6 py-3 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg transition w-full`}>
                Go to Home Page
              </button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageHeader={journalHeader}>
      <div className="flex flex-col md:flex-row gap-8 p-6 max-w-6xl mx-auto w-full">
        {/* Left Column: Write & Edit */}
        <div className="md:w-3/5 space-y-6">
          {/* Guided Prompt Generator */}
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className={`h-3 ${darkMode ? "bg-indigo-600" : "bg-blue-500"}`}></div>
            <div className="p-6">
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
          </div>

          {/* Journal Input */}
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className={`h-3 ${darkMode ? "bg-green-600" : "bg-green-500"}`}></div>
            <div className="p-6">
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
                    className={`text-red-500 hover:text-red-600`}
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
                className={`w-full h-48 border ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-700"
                } rounded-md p-4 focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
                }`}
              />
              
              {/* Mood Selector */}
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
              
              {/* Tags Input */}
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
                    className={`flex-grow border ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300"
                    } rounded-md p-2 focus:outline-none focus:ring-1 ${
                      darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
                    }`}
                  />
                  <button
                    onClick={addTag}
                    className={`ml-2 px-3 py-2 ${
                      darkMode 
                        ? "bg-gray-700 hover:bg-gray-600" 
                        : "bg-gray-200 hover:bg-gray-300"
                    } rounded-md`}
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
                className={`mt-6 px-6 py-3 w-full ${
                  darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
                } text-white rounded-lg shadow-md flex items-center justify-center ${
                  !entry.trim() ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={!entry.trim()}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                    <span>{editingId ? "Updating Entry..." : "Saving Entry..."}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    <span>{editingId ? "Update Entry" : "Save Entry"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Previous Entries */}
        <div className="md:w-2/5 space-y-6">
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className={`h-3 ${darkMode ? "bg-purple-600" : "bg-purple-500"}`}></div>
            <div className="p-6">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4 flex items-center gap-2`}>
                <Calendar className={`h-5 w-5 ${darkMode ? "text-purple-400" : "text-purple-500"}`} />
                Journal Entries
              </h3>
              
              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className={`flex items-center border ${
                  darkMode ? "border-gray-700 bg-gray-700" : "border-gray-300"
                } rounded-lg overflow-hidden`}>
                  <div className={`p-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search entries or tags..."
                    className={`flex-grow p-2 ${
                      darkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white"
                    } focus:outline-none`}
                  />
                </div>
                
                <div className="flex items-center">
                  <Filter size={16} className={`mr-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`py-1 px-2 ${
                      darkMode 
                        ? "bg-gray-700 text-white border-gray-600" 
                        : "bg-white text-gray-700 border-gray-300"
                    } border rounded-md focus:outline-none focus:ring-1 ${
                      darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
                    }`}
                  >
                    <option value="all">All entries</option>
                    <option value="today">Today only</option>
                    <option value="mood">By current mood</option>
                  </select>
                </div>
              </div>
              
              {/* Entries by Date */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {isLoading && entries.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <RefreshCw size={24} className={`${darkMode ? "text-blue-400" : "text-blue-500"} animate-spin`} />
                  </div>
                ) : Object.keys(groupedEntries).length > 0 ? (
                  Object.entries(groupedEntries).map(([date, entriesForDate]: [string, any]) => (
                    <div key={date} className="space-y-3">
                      <div className={`flex items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        <Calendar size={16} className="mr-2" />
                        <h4 className="font-medium">{date}</h4>
                      </div>
                      
                      {entriesForDate.map((item: any) => (
                        <div 
                          key={item.id} 
                          className={`${
                            darkMode ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"
                          } p-4 rounded-lg transition-colors border ${
                            darkMode ? "border-gray-600" : "border-gray-200"
                          }`}
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
                                onClick={() => copyToClipboard(item.entry)}
                                className={`p-1 ${
                                  darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600"
                                }`}
                                title="Copy to clipboard"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => editEntry(item.id)}
                                className={`p-1 ${
                                  darkMode ? "text-yellow-400 hover:text-yellow-300" : "text-yellow-500 hover:text-yellow-600"
                                }`}
                                title="Edit entry"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteEntry(item.id)}
                                className="p-1 text-red-500 hover:text-red-600"
                                title="Delete entry"
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
      </div>
    </PageLayout>
  );
}