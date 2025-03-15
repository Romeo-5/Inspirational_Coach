"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import axios from "axios";
import Link from "next/link";
import Progress from "../components/ui/Progress";

interface Goal {
  id: string;
  title: string;
  category: string;
  deadline: string;
  progress: number;
  completed: boolean;
  createdAt: number;
}

export default function Goals() {
  // State for goals
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [deadline, setDeadline] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState("all");
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Available goal categories with icons
  const categories = [
    { name: "Health", icon: "🏃‍♂️" },
    { name: "Career", icon: "💼" },
    { name: "Learning", icon: "📚" },
    { name: "Mindfulness", icon: "🧘‍♀️" },
    { name: "Finance", icon: "💰" },
    { name: "Personal Growth", icon: "🌱" }
  ];

  // Fetch goals from Firestore
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const goalsQuery = query(collection(db, "goals"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(goalsQuery);
        setGoals(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Goal)));
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
      setLoading(false);
    };
    fetchGoals();
  }, []);

  // Add a new goal
  const addGoal = async () => {
    if (!title || !deadline) {
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

  // Generate AI Motivation
  const generateMotivation = async (goal: Goal) => {
    setLoading(true);
    setActiveGoal(goal);
    try {
      const response = await axios.post("/api/generate-motivation", {
        goalTitle: goal.title,
        progress: goal.progress,
        category: goal.category,
        deadline: goal.deadline
      });
      setMotivationalMessage(response.data.message);
    } catch (error) {
      console.error("Error generating motivation:", error);
      setMotivationalMessage("Failed to generate motivation. Please try again later.");
    }
    setLoading(false);
  };

  // Get filtered goals
  const filteredGoals = goals.filter(goal => {
    if (filter === "completed") return goal.completed;
    if (filter === "in-progress") return !goal.completed;
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
  const getDeadlineColor = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return "text-red-600";
    if (days < 7) return "text-orange-500";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Goal Tracker</h1>
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-500 transition">
            Home
          </Link>
          <Link href="/journal" className="text-gray-600 hover:text-blue-500 transition">
            Journal
          </Link>
          <Link href="/personalized-content" className="text-gray-600 hover:text-purple-500 transition">
            Personalized Inspiration
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Column - Goals List */}
        <div className="lg:w-2/3 space-y-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">Your Goals</h2>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition flex items-center"
            >
              {isFormVisible ? "Cancel" : "Add Goal +"}
            </button>
          </div>

          {/* Add Goal Form - Collapsible */}
          {isFormVisible && (
            <div className="bg-white shadow rounded-lg p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create a New Goal</h3>
              <input
                type="text"
                placeholder="What do you want to achieve?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 mb-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                />
              </div>
              <button
                onClick={addGoal}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:bg-blue-300 transition"
              >
                {loading ? "Adding..." : "Create Goal"}
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 bg-white p-3 rounded-lg shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("in-progress")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "in-progress" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-md transition ${
                filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Goals List */}
          {loading && goals.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">Loading your goals...</p>
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-4">
              {filteredGoals.map((goal) => {
                const daysRemaining = getDaysRemaining(goal.deadline);
                const deadlineColor = getDeadlineColor(goal.deadline);
                
                return (
                  <div 
                    key={goal.id} 
                    className={`bg-white shadow rounded-lg p-6 ${
                      activeGoal?.id === goal.id ? "ring-2 ring-blue-400" : ""
                    } ${goal.completed ? "border-l-4 border-green-500" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                          {categories.find(cat => cat.name === goal.category)?.icon}
                          {goal.title}
                          {goal.completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span>}
                        </h4>
                        <div className="flex gap-3 text-xs mt-1">
                          <span className="text-gray-600">Category: {goal.category}</span>
                          <span className={deadlineColor}>
                            {daysRemaining < 0 
                              ? `Overdue by ${Math.abs(daysRemaining)} days` 
                              : daysRemaining === 0 
                                ? "Due today" 
                                : `${daysRemaining} days left`}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Delete goal"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{goal.progress}% complete</span>
                        <span className="text-xs text-gray-500">Target: {goal.deadline}</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition text-sm"
                        disabled={goal.progress <= 0}
                      >
                        -10%
                      </button>
                      <button
                        onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition text-sm"
                        disabled={goal.progress >= 100}
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => updateGoalProgress(goal.id, 100)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                        disabled={goal.progress >= 100}
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => generateMotivation(goal)}
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition text-sm ml-auto"
                      >
                        Get Motivated
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 italic">No {filter !== 'all' ? filter.replace('-', ' ') + ' ' : ''}goals found.</p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Show all goals
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Motivation & Stats */}
        <div className="lg:w-1/3 space-y-6">
          {/* AI Motivational Message */}
          {activeGoal && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="text-purple-500">✨</span>
                <span>Motivation for {activeGoal.title}</span>
              </h3>
              <div className="text-sm text-gray-500 mb-4">
                {activeGoal.progress < 100 ? (
                  <span>{activeGoal.progress}% complete • {getDaysRemaining(activeGoal.deadline)} days remaining</span>
                ) : (
                  <span className="text-green-500">Completed! 🎉</span>
                )}
              </div>
              
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : motivationalMessage ? (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-gray-700">
                  {motivationalMessage}
                </div>
              ) : (
                <p className="text-gray-500 italic">Click "Get Motivated" to receive personalized encouragement.</p>
              )}
              
              {motivationalMessage && (
                <button
                  onClick={() => generateMotivation(activeGoal)}
                  className="mt-4 w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-sm"
                >
                  Generate New Message
                </button>
              )}
            </div>
          )}

          {/* Goal Statistics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Goal Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-500">Total Goals</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-500">Completed</p>
                <p className="text-2xl font-bold">{goals.filter(g => g.completed).length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold">{goals.filter(g => !g.completed).length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-500">Avg. Progress</p>
                <p className="text-2xl font-bold">
                  {goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0}%
                </p>
              </div>
            </div>

            {/* Category Distribution */}
            {goals.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category Distribution</h4>
                <div className="space-y-2">
                  {categories.map(cat => {
                    const catGoals = goals.filter(g => g.category === cat.name);
                    const percentage = goals.length ? Math.round((catGoals.length / goals.length) * 100) : 0;
                    return (
                      <div key={cat.name} className="flex items-center">
                        <span className="w-6">{cat.icon}</span>
                        <span className="w-24 text-sm">{cat.name}</span>
                        <div className="flex-grow bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right text-xs text-gray-500">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}