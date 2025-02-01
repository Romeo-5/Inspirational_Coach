"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function Journal() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<{ entry: string; timestamp: any }[]>([]);
  const [prompt, setPrompt] = useState("");

  // 🔹 List of guided prompts for journaling
  const prompts = [
    "What made you smile today?",
    "What are you grateful for?",
    "What challenge did you overcome recently?",
    "Describe a moment when you felt truly inspired.",
    "How do you want to improve yourself this week?",
  ];

  // 🔹 Fetch saved journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      const q = query(collection(db, "journal-entries"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      setEntries(querySnapshot.docs.map((doc) => ({
        entry: doc.data().entry,
        timestamp: doc.data().timestamp,
      })));
    };
    fetchEntries();
  }, []);

  // 🔹 Save a new journal entry
  const saveEntry = async () => {
    if (entry.trim() === "") return;
    await addDoc(collection(db, "journal-entries"), {
      entry,
      timestamp: new Date(),
    });
    setEntry("");
  };

  // 🔹 Generate a new guided prompt
  const generatePrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(randomPrompt);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🌟 Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inspirational Coach</h1>
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-500">
            Home
          </Link>
          <Link href="/api/affirmations" className="text-gray-600 hover:text-green-500">
            Daily Affirmations
          </Link>
          <Link href="/feedback" className="text-gray-600 hover:text-purple-500">
            Feedback
          </Link>
        </div>
      </nav>

      {/* 🌟 Journal Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center mt-10">
        <h2 className="text-4xl font-bold text-gray-900">Guided Journaling</h2>
        <p className="text-gray-700 mt-4 max-w-2xl">
          Reflect, express, and grow. Use the prompts below to get started on your journaling journey.
        </p>

        {/* 📝 Guided Prompt Generator */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800">Need inspiration?</h3>
          <p className="text-gray-600 mt-2 italic">{prompt || "Click below to get a journal prompt!"}</p>
          <button
            onClick={generatePrompt}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            Get a Prompt
          </button>
        </div>

        {/* ✍️ Journal Input */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-40 border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={saveEntry}
            className="mt-3 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            Save Entry
          </button>
        </div>

        {/* 📜 Display Past Journal Entries */}
        <div className="mt-10 w-full max-w-2xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Previous Journal Entries</h3>
          {entries.length > 0 ? (
            <ul className="bg-white shadow-md rounded-lg p-6 space-y-4">
              {entries.map((item, index) => (
                <li key={index} className="border-b pb-2 text-gray-700">
                  {item.entry}
                  <span className="block text-sm text-gray-500 mt-1">
                    {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No journal entries yet. Start writing!</p>
          )}
        </div>
      </main>

      {/* 🌟 Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-6">
        <p className="text-gray-600">© 2025 Inspirational Coach. All rights reserved.</p>
      </footer>
    </div>
  );
}
