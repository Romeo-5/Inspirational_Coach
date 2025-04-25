"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import axios from "axios";
import Link from "next/link";
import Progress from "../components/ui/Progress";
import { 
  Target, BookOpen, Star, MessageCircle, Sun, Moon, Sparkles, 
  Save, Trash, Edit, RefreshCw, PlusCircle, Filter, ChevronDown, 
  CheckCircle, Award, Calendar, TrendingUp, Clipboard, X, PieChart
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  category: string;
  deadline: string;
  progress: number;
  completed: boolean;
  createdAt: number;
  userId: string;
}

export default function Goals() {
  const { user, loading: userLoading } = useUser();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [deadline, setDeadline] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState("all");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Available goal categories with icons
  const categories = [
    { name: "Health", icon: "🏃‍♂️" },
    { name: "Career", icon: "💼" },
    { name: "Learning", icon: "📚" },
    { name: "Mindfulness", icon: "🧘‍♀️" },
    { name: "Finance", icon: "💰" },
    { name: "Personal Growth", icon: "🌱" }
  ];

  // Dark mode toggle
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

 // Fetch goals from Firestore (updated)
 useEffect(() => {
  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      return;
    }
    
    setLoading(true);
    try {
      // Add where clause to filter by user ID
      const goalsQuery = query(
        collection(db, "goals"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(goalsQuery);
      setGoals(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Goal)));
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
    setLoading(false);
  };
  
  fetchGoals();
}, [user]);

// Add a new goal (updated)
const addGoal = async () => {
  if (!title || !deadline || !user) {
    alert("Please enter a goal title and deadline.");
    return;
  }
  
  setLoading(true);
  try {
    const newGoal = {
      title,
      category,
      deadline,
      progress: 0,
      completed: false,
      createdAt: Date.now(),
      userId: user.uid,  // Include user ID
    };
    
    const docRef = await addDoc(collection(db, "goals"), newGoal);
    setGoals([{ id: docRef.id, ...newGoal }, ...goals]);
    setTitle("");
    setDeadline("");
    setIsFormVisible(false);
  } catch (error) {
    console.error("Error adding goal:", error);
  }
  setLoading(false);
};

  // Update goal progress
  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      // Ensure progress stays between 0-100
      newProgress = Math.max(0, Math.min(100, newProgress));
      
      const goalDoc = doc(db, "goals", goalId);
      await updateDoc(goalDoc, { 
        progress: newProgress, 
        completed: newProgress >= 100 
      });
      
      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, progress: newProgress, completed: newProgress >= 100 } : goal
        )
      );
      
      // If this is the active goal, update it
      if (activeGoal && activeGoal.id === goalId) {
        setActiveGoal({...activeGoal, progress: newProgress, completed: newProgress >= 100});
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    
    try {
      await deleteDoc(doc(db, "goals", goalId));
      setGoals(goals.filter(goal => goal.id !== goalId));
      if (activeGoal && activeGoal.id === goalId) {
        setActiveGoal(null);
        setMotivationalMessage("");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const generateMotivation = async (goal: Goal) => {
    setLoading(true);
    setActiveGoal(goal);
  
    try {
      const response = await axios.post("/goal", {
        prompt: `You are a personal inspirational coach. Generate ONE single, cohesive inspirational message (2-3 sentences) that:
  
          1. Directly addresses the goal titled "${goal.title}".
          2. Acknowledges the current progress of ${goal.progress}%.
          3. Highlights the category of ${goal.category}.
          4. Considers the deadline of ${goal.deadline}.
          5. Uses an encouraging, supportive tone.
          6. Speaks directly to the reader using "you".
          7. Is complete and well-structured.
  
          Do not use bullet points or multiple options. Do not include phrases like "Here is an inspirational message." Do not label or explain the output. Simply provide the inspirational message itself, with a clear beginning and end.`,
        max_tokens: 150,
      });
  
      setMotivationalMessage(response.data.response);
      console.log("Generated Content:", response.data.response);
    } catch (error) {
      console.error("Error generating motivation:", error);
      setMotivationalMessage("Failed to generate motivation. Please try again later.");
    }
  
    setLoading(false);
  };

  // Get filtered goals
  const filteredGoals = goals.filter(goal => {
    if (filter === "completed") return goal.completed;
    if (filter === "in-progress") return !goal.completed && goal.progress > 0;
    if (filter === "not-started") return goal.progress === 0;
    return true; // "all"
  });

  // Calculate days remaining for a goal
  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get color based on days remaining
  const getDeadlineColor = (deadline: string, completed: boolean) => {
    if (completed) return darkMode ? "text-green-400" : "text-green-500";
    
    const days = getDaysRemaining(deadline);
    if (days < 0) return "text-red-500";
    if (days < 3) return "text-red-400";
    if (days < 7) return "text-orange-400";
    return darkMode ? "text-gray-400" : "text-gray-500";
  };
  
  // Get deadline text
  const getDeadlineText = (deadline: string, completed: boolean) => {
    if (completed) return "Completed";
    
    const days = getDaysRemaining(deadline);
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days left`;
  };

  // Sort categories by usage
  const categoriesByUsage = [...categories].sort((a, b) => {
    const countA = goals.filter(goal => goal.category === a.name).length;
    const countB = goals.filter(goal => goal.category === b.name).length;
    return countB - countA;
  });

  // Add a login prompt for unauthenticated users
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Target className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your personal goals and start tracking your progress.
          </p>
          <Link href="/">
            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition w-full">
              Go to Home Page
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800" : "bg-gradient-to-b from-gray-50 to-gray-100"}`}>
      {/* Navigation Bar */}
      <nav className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-10`}>
        <Link href="/" className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
          <Sparkles className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-500"}`} />
          <span>Inspirational Coach</span>
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/journal" className={`${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-500"} transition flex items-center gap-1`}>
            <BookOpen className="h-4 w-4" />
            <span>Journal</span>
          </Link>
          <Link href="/goals" className={`${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition flex items-center gap-1 font-medium`}>
            <Target className="h-4 w-4" />
            <span>Goal Tracking</span>
          </Link>
          <Link href="/affirmations" className={`${darkMode ? "text-gray-300 hover:text-green-400" : "text-gray-600 hover:text-green-500"} transition flex items-center gap-1`}>
            <Star className="h-4 w-4" />
            <span>Daily Affirmations</span>
          </Link>
          <Link href="/personalized-content" className={`${darkMode ? "text-gray-300 hover:text-purple-400" : "text-gray-600 hover:text-purple-500"} transition flex items-center gap-1`}>
            <Sparkles className="h-4 w-4" />
            <span>Personalized Inspiration</span>
          </Link>
          <Link href="/feedback" className={`${darkMode ? "text-gray-300 hover:text-purple-400" : "text-gray-600 hover:text-purple-500"} transition flex items-center gap-1`}>
            <MessageCircle className="h-4 w-4" />
            <span>Feedback</span>
          </Link>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
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

      {/* Header Section */}
      <section className={`py-10 px-6 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-blue-50 to-purple-50"}`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} leading-tight`}>
            Transform Your <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Aspirations</span> into Achievements
          </h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mt-4 text-lg max-w-3xl mx-auto`}>
            Set meaningful goals, track your progress, and get personalized motivation to help you succeed.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row gap-8 p-6 max-w-6xl mx-auto w-full">
        {/* Left Column - Goals List */}
        <div className="md:w-3/5 space-y-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} flex items-center gap-2`}>
              <Target className={darkMode ? "text-blue-400" : "text-blue-500"} />
              Your Goals
            </h2>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className={`px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg shadow hover:shadow-md transition flex items-center gap-1`}
            >
              {isFormVisible ? (
                <>
                  <X size={18} /> Cancel
                </>
              ) : (
                <>
                  <PlusCircle size={18} /> Add Goal
                </>
              )}
            </button>
          </div>

          {/* Add Goal Form - Collapsible */}
          {isFormVisible && (
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-md rounded-xl overflow-hidden animate-fade-in`}>
              <div className={`h-3 ${darkMode ? "bg-blue-600" : "bg-blue-500"}`}></div>
              <div className="p-6">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>Create a New Goal</h3>
                
                <input
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full border ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-700"
                  } rounded-md p-3 mb-4 focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
                  }`}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full border ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "bg-white border-gray-300 text-gray-700"
                      } rounded-md p-3 focus:outline-none focus:ring-2 ${
                        darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className={`w-full border ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "bg-white border-gray-300 text-gray-700"
                      } rounded-md p-3 focus:outline-none focus:ring-2 ${
                        darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
                      }`}
                    />
                  </div>
                </div>
                
                <button
                  onClick={addGoal}
                  disabled={loading || !title || !deadline}
                  className={`w-full px-6 py-3 ${
                    darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
                  } text-white rounded-lg shadow hover:shadow-md transition flex items-center justify-center gap-2 ${
                    (loading || !title || !deadline) ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Save size={18} />
                  {loading ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className="p-4 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md transition flex items-center gap-1 ${
                  filter === "all" 
                    ? darkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-blue-500 text-white"
                    : darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Clipboard size={16} />
                All
              </button>
              <button
                onClick={() => setFilter("in-progress")}
                className={`px-4 py-2 rounded-md transition flex items-center gap-1 ${
                  filter === "in-progress" 
                    ? darkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-blue-500 text-white"
                    : darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <TrendingUp size={16} />
                In Progress
              </button>
              <button
                onClick={() => setFilter("not-started")}
                className={`px-4 py-2 rounded-md transition flex items-center gap-1 ${
                  filter === "not-started" 
                    ? darkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-blue-500 text-white"
                    : darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Calendar size={16} />
                Not Started
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-md transition flex items-center gap-1 ${
                  filter === "completed" 
                    ? darkMode 
                      ? "bg-green-600 text-white" 
                      : "bg-green-500 text-white"
                    : darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CheckCircle size={16} />
                Completed
              </button>
            </div>
          </div>

          {/* Goals List */}
          {loading && goals.length === 0 ? (
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl p-6 text-center`}>
              <div className="flex justify-center mb-3">
                <RefreshCw size={24} className={`${darkMode ? "text-blue-400" : "text-blue-500"} animate-spin`} />
              </div>
              <p className={darkMode ? "text-gray-300" : "text-gray-500"}>Loading your goals...</p>
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-4">
              {filteredGoals.map((goal) => {
                const deadlineColor = getDeadlineColor(goal.deadline, goal.completed);
                const deadlineText = getDeadlineText(goal.deadline, goal.completed);
                
                return (
                  <div 
                    key={goal.id} 
                    className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl overflow-hidden ${
                      activeGoal?.id === goal.id 
                        ? darkMode 
                          ? "ring-2 ring-blue-500" 
                          : "ring-2 ring-blue-400" 
                        : ""
                    }`}
                  >
                    <div className={`h-1 ${
                      goal.completed
                        ? darkMode ? "bg-green-600" : "bg-green-500"
                        : goal.progress > 0
                          ? darkMode ? "bg-blue-600" : "bg-blue-500" 
                          : darkMode ? "bg-gray-600" : "bg-gray-400"
                    }`}></div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
                            {categories.find(cat => cat.name === goal.category)?.icon}
                            {goal.title}
                            {goal.completed && (
                              <span className={`text-xs ${darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"} px-2 py-1 rounded flex items-center gap-1`}>
                                <CheckCircle size={12} /> Achieved
                              </span>
                            )}
                          </h4>
                          <div className="flex gap-3 text-xs mt-1">
                            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                              {goal.category}
                            </span>
                            <span className={deadlineColor}>
                              {deadlineText}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className={`${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-400 hover:text-red-500"} transition`}
                            title="Delete goal"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {goal.progress}% complete
                          </span>
                          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Target: {new Date(goal.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className={goal.completed ? darkMode ? "bg-green-600" : "bg-green-500" : ""}>
                          <Progress value={goal.progress} />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                          className={`px-3 py-1 ${
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          } rounded hover:shadow transition text-sm flex items-center gap-1`}
                          disabled={goal.progress <= 0 || goal.completed}
                        >
                          -10%
                        </button>
                        <button
                          onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                          className={`px-3 py-1 ${
                            darkMode 
                              ? "bg-blue-900 text-blue-300 hover:bg-blue-800" 
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          } rounded hover:shadow transition text-sm flex items-center gap-1`}
                          disabled={goal.progress >= 100 || goal.completed}
                        >
                          +10%
                        </button>
                        {goal.progress < 100 && !goal.completed && (
                          <button
                            onClick={() => updateGoalProgress(goal.id, 100)}
                            className={`px-3 py-1 ${
                              darkMode 
                                ? "bg-green-700 text-white hover:bg-green-600" 
                                : "bg-green-500 text-white hover:bg-green-600"
                            } rounded hover:shadow transition text-sm flex items-center gap-1`}
                          >
                            <CheckCircle size={14} />
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => generateMotivation(goal)}
                          className={`px-3 py-1 ${
                            darkMode 
                              ? "bg-purple-900 text-purple-300 hover:bg-purple-800" 
                              : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                          } rounded hover:shadow transition text-sm ml-auto flex items-center gap-1`}
                        >
                          <Sparkles size={14} />
                          Get Motivated
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl p-8 text-center`}>
              <div className="flex justify-center mb-4">
                <Target size={32} className={darkMode ? "text-gray-600" : "text-gray-400"} />
              </div>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} italic mb-4`}>
                No {filter !== 'all' ? filter.replace('-', ' ') + ' ' : ''}goals found.
              </p>
              {filter !== 'all' ? (
                <button 
                  onClick={() => setFilter('all')}
                  className={`${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600"} hover:underline`}
                >
                  Show all goals
                </button>
              ) : (
                <button 
                  onClick={() => setIsFormVisible(true)}
                  className={`px-4 py-2 ${
                    darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                  } text-white rounded-lg shadow transition flex items-center gap-1 mx-auto`}
                >
                  <PlusCircle size={18} />
                  Create your first goal
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Motivation & Stats */}
        <div className="md:w-2/5 space-y-6">
          {/* Motivational Message Section */}
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className={`h-3 ${darkMode ? "bg-purple-600" : "bg-purple-500"}`}></div>
            <div className="p-6">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4 flex items-center gap-2`}>
                <Sparkles className={darkMode ? "text-purple-400" : "text-purple-500"} />
                Your Personalized Motivation
              </h3>
              
              {activeGoal ? (
                <div>
                  <div className={`mb-4 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="font-medium">Selected Goal:</span> {activeGoal.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-grow h-2">
                        <Progress value={activeGoal.progress} />
                      </div>
                      <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {activeGoal.progress}%
                      </span>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw size={24} className={`${darkMode ? "text-purple-400" : "text-purple-500"} animate-spin mx-auto mb-3`} />
                      <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Generating your motivation...</p>
                    </div>
                  ) : motivationalMessage ? (
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-purple-900/20" : "bg-purple-50"} border ${darkMode ? "border-purple-800" : "border-purple-100"}`}>
                      <p className={`italic ${darkMode ? "text-gray-200" : "text-gray-700"} mb-3`}>
                        "{motivationalMessage}"
                      </p>
                      <button
                        onClick={() => generateMotivation(activeGoal)}
                        className={`text-sm ${darkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} flex items-center gap-1`}
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>
                    </div>
                  ) : (
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-center py-4`}>
                      Your motivation will appear here.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award size={32} className={darkMode ? "text-gray-600" : "text-gray-400"} />
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-4`}>
                    Select a goal and click "Get Motivated" to receive personalized encouragement.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats & Progress Summary */}
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className={`h-3 ${darkMode ? "bg-green-600" : "bg-green-500"}`}></div>
            <div className="p-6">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4 flex items-center gap-2`}>
                <TrendingUp className={darkMode ? "text-green-400" : "text-green-500"} />
                Your Progress Summary
              </h3>
              
              {goals.length > 0 ? (
                <div className="space-y-6">
                  {/* Progress Overview Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>
                        Completion Rate
                      </h4>
                      <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {Math.round((goals.filter(g => g.completed).length / goals.length) * 100)}%
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>
                        Goals In Progress
                      </h4>
                      <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {goals.filter(g => g.progress > 0 && !g.completed).length}
                      </p>
                    </div>
                  </div>
                  
                  {/* Categories Breakdown */}
                  <div>
                    <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-3`}>
                      Goals by Category
                    </h4>
                    <div className="space-y-2">
                      {categoriesByUsage.filter(cat => goals.some(g => g.category === cat.name)).map(cat => {
                        const categoryGoals = goals.filter(g => g.category === cat.name);
                        const completedInCategory = categoryGoals.filter(g => g.completed).length;
                        const percentage = (completedInCategory / categoryGoals.length) * 100;
                        
                        return (
                          <div key={cat.name} className="flex items-center gap-3">
                            <span className="text-xl">{cat.icon}</span>
                            <div className="flex-grow">
                              <div className="flex justify-between items-center">
                                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  {cat.name}
                                </span>
                                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {completedInCategory}/{categoryGoals.length} completed
                                </span>
                              </div>
                              <div className="mt-1 h-1">
                                <Progress value={percentage} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Recent Achievements */}
                  <div>
                    <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-3 flex items-center gap-1`}>
                      <Award size={16} className={darkMode ? "text-yellow-400" : "text-yellow-500"} />
                      Recent Achievements
                    </h4>
                    
                    {goals.filter(g => g.completed).length > 0 ? (
                      <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <ul className="space-y-2">
                          {goals
                            .filter(g => g.completed)
                            .sort((a, b) => b.progress - a.progress)
                            .slice(0, 3)
                            .map(goal => (
                              <li key={goal.id} className="flex items-center gap-2">
                                <CheckCircle size={16} className={darkMode ? "text-green-400" : "text-green-500"} />
                                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  {goal.title}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ) : (
                      <p className={`text-sm italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        No completed goals yet. Keep pushing!
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart size={32} className={darkMode ? "text-gray-600 mx-auto" : "text-gray-400 mx-auto"} />
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-4`}>
                    Add some goals to see your progress statistics here.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Tips & Best Practices */}
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
            <div className={`h-3 ${darkMode ? "bg-yellow-600" : "bg-yellow-500"}`}></div>
            <div className="p-6">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4 flex items-center gap-2`}>
                <BookOpen className={darkMode ? "text-yellow-400" : "text-yellow-500"} />
                Goal Setting Tips
              </h3>
              
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-3`}>
                  <span className="font-medium">Tip of the day:</span> Break down larger goals into smaller, 
                  manageable tasks. Celebrating small wins keeps you motivated throughout your journey.
                </p>
                <button
                  className={`text-sm ${darkMode ? "text-yellow-400 hover:text-yellow-300" : "text-yellow-600 hover:text-yellow-700"} flex items-center gap-1`}
                >
                  <RefreshCw size={14} />
                  New Tip
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-auto py-6 ${darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>© 2025 Inspirational Coach. Your personal companion for growth and achievement.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/privacy" className={darkMode ? "hover:text-gray-300" : "hover:text-gray-800"}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={darkMode ? "hover:text-gray-300" : "hover:text-gray-800"}>
              Terms of Service
            </Link>
            <Link href="/contact" className={darkMode ? "hover:text-gray-300" : "hover:text-gray-800"}>
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
