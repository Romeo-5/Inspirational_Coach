'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, BookOpen, Star, Target, MessageCircle, Send, ThumbsUp } from "lucide-react";

export default function Feedback() {
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(4);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Feedback types
  const FEEDBACK_TYPES = [
    { id: "suggestion", name: "Suggestion", color: "bg-blue-500" },
    { id: "feature", name: "Feature Request", color: "bg-purple-500" },
    { id: "bug", name: "Bug Report", color: "bg-red-500" },
    { id: "praise", name: "Praise", color: "bg-green-500" },
    { id: "other", name: "Other", color: "bg-orange-500" },
  ];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);
    }, 800);
  };

  // Reset form and allow submission of another feedback
  const submitAnother = () => {
    setFeedbackText("");
    setFeedbackType("suggestion");
    setRating(4);
    setSubmitted(false);
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
          <Link href="/affirmations" className="text-gray-600 hover:text-blue-500 transition flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Daily Affirmations</span>
          </Link>
          <Link href="/personalized-content" className="text-gray-600 hover:text-purple-500 transition flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Personalized Inspiration</span>
          </Link>
          <Link href="/goals" className="text-gray-600 hover:text-orange-500 transition flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Goal Tracking</span>
          </Link>
          <Link href="/feedback" className="text-purple-600 border-b-2 border-purple-500 pb-1 transition flex items-center gap-1">
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

      {/* Page Header */}
      <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/90 hover:text-white flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Share Your Feedback</h1>
          <p className="mt-4 text-purple-100 max-w-2xl">
            Your insights help us improve. Whether you have suggestions, found a bug, or simply want to share your experience, we'd love to hear from you.
          </p>
        </div>
      </header>

      <main className="flex-grow py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You for Your Feedback!</h2>
              <p className="text-gray-600 mb-8">
                Your input is valuable to us and helps make Inspirational Coach better for everyone. We've received your feedback and will review it soon.
              </p>
              <button 
                onClick={submitAnother}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Submit Another Feedback
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-2 bg-purple-500"></div>
              <div className="p-8">
                <form onSubmit={handleSubmit}>
                  {/* Feedback Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What type of feedback do you have?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {FEEDBACK_TYPES.map(type => (
                        <button 
                          type="button"
                          key={type.id}
                          onClick={() => setFeedbackType(type.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            feedbackType === type.id 
                              ? `${type.color} text-white`
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Rating Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you rate your experience with Inspirational Coach?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-lg transition ${
                            rating >= star ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        >
                          <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Feedback Text Area */}
                  <div className="mb-6">
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Feedback
                    </label>
                    <textarea
                      id="feedback"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Please share your thoughts, ideas, or experiences..."
                      required
                    ></textarea>
                  </div>
                  
                  {/* Optional Contact Information */}
                  <div className="mb-8">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Share your email if you'd like us to follow up with you about your feedback.
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !feedbackText.trim()}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition
                      ${(isLoading || !feedbackText.trim()) 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {/* FAQ Section */}
          <div className="mt-10 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">How is my feedback used?</h3>
                <p className="text-gray-600">Your feedback helps us prioritize improvements and new features. We review all submissions and use them to guide our development roadmap.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Will I receive a response to my feedback?</h3>
                <p className="text-gray-600">If you provide your email address, we may reach out regarding specific issues or to get additional information. However, we cannot guarantee individual responses to all feedback.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">How can I report urgent issues?</h3>
                <p className="text-gray-600">For time-sensitive matters or technical support, please select "Bug Report" as your feedback type and include "URGENT" in your message.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Can I suggest new features?</h3>
                <p className="text-gray-600">Absolutely! We love hearing your ideas for new features. Select "Feature Request" as your feedback type and describe your suggestion in detail.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span>Inspirational Coach</span>
              </h3>
              <p className="text-gray-400 max-w-md">
                Empowering individuals to achieve personal growth through inspiration, goal setting, and daily practice.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Inspirational Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}