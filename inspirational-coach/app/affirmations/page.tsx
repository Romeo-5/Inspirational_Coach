'use client';

import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useDarkMode } from "../context/DarkModeContext";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import { RefreshCw, Heart, Share2, Star } from "lucide-react";
import Link from "next/link";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

// Sample affirmation categories
const AFFIRMATION_CATEGORIES = [
  { id: "confidence", name: "Confidence", color: "bg-blue-500" },
  { id: "gratitude", name: "Gratitude", color: "bg-green-500" },
  { id: "resilience", name: "Resilience", color: "bg-purple-500" },
  { id: "mindfulness", name: "Mindfulness", color: "bg-orange-500" },
  { id: "growth", name: "Growth", color: "bg-pink-500" },
];

// Sample affirmations by category
const AFFIRMATIONS = {
  confidence: [
    "I am capable of achieving everything I set my mind to.",
    "I trust my intuition and make decisions with confidence.",
    "I embrace challenges as opportunities to showcase my abilities.",
    "My confidence grows stronger with each passing day.",
    "I am worthy of success and recognize my own value."
  ],
  gratitude: [
    "I am thankful for the abundance that flows into my life each day.",
    "I appreciate the small moments of joy that surround me.",
    "I am grateful for the lessons each challenge brings.",
    "My heart is full of appreciation for the people in my life.",
    "I celebrate the gift of today with a grateful spirit."
  ],
  resilience: [
    "I am stronger than any obstacle that comes my way.",
    "I bounce back from setbacks with renewed determination.",
    "Every challenge I face is shaping me into a stronger person.",
    "I have the power to overcome any difficulty with grace.",
    "My resilience is unlimited; I persist until I succeed."
  ],
  mindfulness: [
    "I am fully present in this moment, embracing all it has to offer.",
    "I release worries about the past and future, focusing on now.",
    "My breath centers me and brings me back to the present.",
    "I notice the beauty in ordinary moments throughout my day.",
    "I cultivate peace within myself in all situations."
  ],
  growth: [
    "Every day I am becoming a better version of myself.",
    "I embrace change as an opportunity for growth and learning.",
    "My potential is limitless and expands with each new experience.",
    "I am constantly evolving and improving in all areas of life.",
    "I welcome new perspectives that challenge my thinking."
  ]
};

export default function Affirmations() {
  const { user, loading: userLoading } = useUser();
  const { darkMode } = useDarkMode();
  type AffirmationCategory = keyof typeof AFFIRMATIONS;
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>("confidence");
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAffirmations, setSavedAffirmations] = useState<{ id: string; text: string; category: AffirmationCategory; date: string }[]>([]);

  // Fetch saved affirmations
  useEffect(() => {
    const fetchSavedAffirmations = async () => {
      if (!user) {
        setSavedAffirmations([]);
        return;
      }
      
      try {
        const q = query(
          collection(db, "saved-affirmations"), 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        setSavedAffirmations(querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          category: doc.data().category,
          date: new Date(doc.data().createdAt.toDate()).toLocaleDateString()
        })));
      } catch (error) {
        console.error("Error fetching saved affirmations:", error);
      }
    };
    
    fetchSavedAffirmations();
  }, [user]);

  // Generate a random affirmation from the selected category
  const generateAffirmation = () => {
    setIsLoading(true);
    
    // Check if the current affirmation is saved
    const currentIsFavorite = savedAffirmations.some(item => item.text === currentAffirmation);
    
    // Simulate API call delay
    setTimeout(() => {
      const categoryAffirmations = AFFIRMATIONS[selectedCategory];
      const randomIndex = Math.floor(Math.random() * categoryAffirmations.length);
      const newAffirmation = categoryAffirmations[randomIndex];
      
      setCurrentAffirmation(newAffirmation);
      setIsFavorite(savedAffirmations.some(item => item.text === newAffirmation));
      setIsLoading(false);
    }, 600);
  };

  // Check if current affirmation is favorite when affirmation or saved list changes
  useEffect(() => {
    if (currentAffirmation) {
      setIsFavorite(savedAffirmations.some(item => item.text === currentAffirmation));
    }
  }, [currentAffirmation, savedAffirmations]);

  // Save current affirmation to favorites
  const toggleFavorite = async () => {
    if (!user) return;
    
    if (isFavorite) {
      // Find the affirmation to delete
      const affirmationToDelete = savedAffirmations.find(item => item.text === currentAffirmation);
      if (affirmationToDelete) {
        try {
          await deleteDoc(doc(db, "saved-affirmations", affirmationToDelete.id));
          setSavedAffirmations(savedAffirmations.filter(item => item.id !== affirmationToDelete.id));
          setIsFavorite(false);
        } catch (error) {
          console.error("Error removing affirmation:", error);
        }
      }
    } else {
      // Add new favorite
      try {
        const newAffirmation = {
          text: currentAffirmation,
          category: selectedCategory,
          userId: user.uid,
          createdAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, "saved-affirmations"), newAffirmation);
        
        setSavedAffirmations([
          {
            id: docRef.id,
            text: currentAffirmation,
            category: selectedCategory,
            date: new Date().toLocaleDateString()
          },
          ...savedAffirmations
        ]);
        
        setIsFavorite(true);
      } catch (error) {
        console.error("Error saving affirmation:", error);
      }
    }
  };

  // Initial affirmation on page load or category change
  useEffect(() => {
    generateAffirmation();
  }, [selectedCategory]);

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
            <Star className={`h-12 w-12 ${darkMode ? "text-green-400" : "text-green-500"} mx-auto mb-4`} />
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-2`}>Sign In Required</h1>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
              Please sign in to access your personal affirmations and save your favorites.
            </p>
            <Link href="/">
              <button className={`px-6 py-3 ${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white rounded-lg transition w-full`}>
                Go to Home Page
              </button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const affirmationsHeader = (
    <PageHeader
      title="Your Daily Affirmations"
      description="Positive affirmations can transform your mindset and empower your day. Select a category that resonates with you and embrace these powerful statements."
      gradientFrom="blue-500"
      gradientTo="purple-600"
      icon={<Star size={24} />}
    />
  );

  return (
    <PageLayout pageHeader={affirmationsHeader}>
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Category Selection */}
          <div className="mb-8">
            <h2 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>Choose your focus for today:</h2>
            <div className="flex flex-wrap gap-3">
              {AFFIRMATION_CATEGORIES.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as AffirmationCategory)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id 
                      ? `${category.color} text-white`
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Affirmation Card */}
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg overflow-hidden mb-10`}>
            <div className={`h-2 ${AFFIRMATION_CATEGORIES.find(c => c.id === selectedCategory)?.color}`}></div>
            <div className="p-8">
              <h3 className={`text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"} mb-6`}>
                {AFFIRMATION_CATEGORIES.find(c => c.id === selectedCategory)?.name} Affirmation
              </h3>
              
              <div className="min-h-40 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className={`h-10 w-10 ${darkMode ? "text-blue-400" : "text-blue-500"} animate-spin`} />
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-4`}>Preparing your affirmation...</p>
                  </div>
                ) : (
                  <p className={`text-2xl text-center font-medium ${darkMode ? "text-white" : "text-gray-800"} leading-relaxed`}>
                    "{currentAffirmation}"
                  </p>
                )}
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <button 
                  onClick={generateAffirmation}
                  className={`px-4 py-2 ${
                    darkMode 
                      ? "bg-blue-900 text-blue-300 hover:bg-blue-800" 
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  } rounded-lg transition flex items-center gap-2`}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>New Affirmation</span>
                </button>
                
                <div className="flex gap-3">
                  <button 
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition ${
                      isFavorite 
                        ? darkMode
                          ? 'bg-red-900 text-red-400' 
                          : 'bg-red-100 text-red-500' 
                        : darkMode
                          ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button className={`p-2 rounded-full ${
                    darkMode
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  } transition`}>
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Section */}
          <div className={`${darkMode ? "bg-blue-900/30" : "bg-blue-50"} rounded-xl p-6 mb-10`}>
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>Practice Tips</h3>
            <ul className={`space-y-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <li className="flex gap-2">
                <div className={`mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>•</div>
                <p>Repeat your affirmation aloud 3 times each morning and evening</p>
              </li>
              <li className="flex gap-2">
                <div className={`mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>•</div>
                <p>Write your affirmation in a journal to reinforce its message</p>
              </li>
              <li className="flex gap-2">
                <div className={`mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>•</div>
                <p>Use your affirmation as a meditation focus for 5 minutes daily</p>
              </li>
              <li className="flex gap-2">
                <div className={`mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>•</div>
                <p>Say your affirmation with conviction while looking at yourself in the mirror</p>
              </li>
            </ul>
          </div>

          {/* Saved Affirmations */}
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Your Saved Affirmations</h3>
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {savedAffirmations.length} saved
              </div>
            </div>

            {savedAffirmations.length === 0 ? (
              <div className={`text-center py-10 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <Heart className={`h-10 w-10 mx-auto mb-4 ${darkMode ? "opacity-30" : "opacity-50"}`} />
                <p>You haven't saved any affirmations yet.</p>
                <p className="text-sm mt-2">Like an affirmation to save it for future reference.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {savedAffirmations.map((affirmation, index) => (
                  <li key={index} className={`border-b ${darkMode ? "border-gray-700" : "border-gray-100"} pb-4 last:border-0`}>
                    <p className={darkMode ? "text-gray-200" : "text-gray-800"}>"{affirmation.text}"</p>
                    <div className="flex justify-between mt-2">
                      <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{affirmation.date}</span>
                      <span className={`text-sm font-medium ${darkMode ? "text-blue-400" : "text-blue-500"}`}>{
                        AFFIRMATION_CATEGORIES.find(c => c.id === affirmation.category)?.name
                      }</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}