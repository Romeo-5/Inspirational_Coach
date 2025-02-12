"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
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
}

export default function Goals() {
  // State for goals
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");

  // Available goal categories
  const categories = ["Health", "Career", "Learning", "Mindfulness", "Finance", "Personal Growth"];

  // Fetch goals from Firestore
  useEffect(() => {
    const fetchGoals = async () => {
      const querySnapshot = await getDocs(collection(db, "goals"));
      setGoals(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Goal)));
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
      };
      const docRef = await addDoc(collection(db, "goals"), newGoal);
      setGoals([...goals, { id: docRef.id, ...newGoal }]);
      setTitle("");
      setDeadline("");
    } catch (error) {
      console.error("Error adding goal:", error);
    }
    setLoading(false);
  };

  // Update goal progress
  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const goalDoc = doc(db, "goals", goalId);
      await updateDoc(goalDoc, { progress: newProgress, completed: newProgress >= 100 });
      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, progress: newProgress, completed: newProgress >= 100 } : goal
        )
      );
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  // Generate AI Motivation
  const generateMotivation = async (goal: Goal) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/generate-motivation", {
        goalTitle: goal.title,
        progress: goal.progress,
      });
      setMotivationalMessage(response.data.message);
    } catch (error) {
      console.error("Error generating motivation:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🌟 Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Goal Tracker</h1>
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-500">
            Home
          </Link>
          <Link href="/journal" className="text-gray-600 hover:text-blue-500">
            Journal
          </Link>
          <Link href="/personalized-content" className="text-gray-600 hover:text-purple-500">
            Personalized Inspiration
          </Link>
        </div>
      </nav>

      {/* 🌟 Goal Tracking Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center mt-10">
        <h2 className="text-4xl font-bold text-gray-900">Set & Track Your Goals</h2>
        <p className="text-gray-700 mt-4 max-w-2xl">
          Define your goals, track progress, and stay motivated with AI-driven insights.
        </p>

        {/* Goal Input Form */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800">Create a Goal</h3>
          <input
            type="text"
            placeholder="Goal title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-2"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-2"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mt-2"
          />
          <button
            onClick={addGoal}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            {loading ? "Adding..." : "Add Goal"}
          </button>
        </div>

        {/* List of Goals */}
        <div className="mt-10 w-full max-w-2xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Goals</h3>
          {goals.length > 0 ? (
            <ul className="bg-white shadow-md rounded-lg p-6 space-y-4">
              {goals.map((goal) => (
                <li key={goal.id} className="border-b pb-2 text-gray-700">
                  <h4 className="font-semibold">{goal.title} ({goal.category})</h4>
                  <p className="text-sm text-gray-500">Deadline: {goal.deadline}</p>
                  <Progress value={goal.progress}/>
                  <button
                    onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Increase Progress
                  </button>
                  <button
                    onClick={() => generateMotivation(goal)}
                    className="mt-2 ml-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                  >
                    Get Motivation
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No goals set yet. Start now!</p>
          )}
        </div>

        {/* AI Motivational Message */}
        {motivationalMessage && (
          <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800">AI Motivation</h3>
            <p className="text-gray-700 mt-2">{motivationalMessage}</p>
          </div>
        )}
      </main>
    </div>
  );
}
