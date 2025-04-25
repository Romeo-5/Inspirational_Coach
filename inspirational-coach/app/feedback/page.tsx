"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, ThumbsUp, RefreshCw } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useDarkMode } from "../context/DarkModeContext";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

export default function Feedback() {
  const { user } = useUser();
  const { darkMode } = useDarkMode();
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

  // Create the page header
  const feedbackHeader = (
    <PageHeader
      title="Share Your Feedback"
      description="Your insights help us improve. Whether you have suggestions, found a bug, or simply want to share your experience, we'd love to hear from you."
      gradientFrom="purple-500"
      gradientTo="indigo-600"
      icon={<MessageCircle size={24} />}
    />
  );

  return (
    <PageLayout pageHeader={feedbackHeader}>
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-8 text-center`}>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>Thank You for Your Feedback!</h2>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-8`}>
                Your input is valuable to us and helps make Inspirational Coach better for everyone. We've received your feedback and will review it soon.
              </p>
              <button 
                onClick={submitAnother}
                className={`px-6 py-3 ${darkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-600 hover:bg-purple-700"} text-white rounded-lg transition`}
              >
                Submit Another Feedback
              </button>
            </div>
          ) : (
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md rounded-xl overflow-hidden`}>
              <div className="h-2 bg-purple-500"></div>
              <div className="p-8">
                <form onSubmit={handleSubmit}>
                  {/* Feedback Type Selection */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
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
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
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
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                      How would you rate your experience with Inspirational Coach?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-lg transition ${
                            rating >= star 
                              ? 'text-yellow-500' 
                              : darkMode ? 'text-gray-600' : 'text-gray-300'
                          }`}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill={rating >= star ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            className="h-8 w-8"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Feedback Text Area */}
                  <div className="mb-6">
                    <label htmlFor="feedback" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                      Your Feedback
                    </label>
                    <textarea
                      id="feedback"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={6}
                      className={`w-full p-3 border ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                          : "border-gray-300 text-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      placeholder="Please share your thoughts, ideas, or experiences..."
                      required
                    ></textarea>
                  </div>
                  
                  {/* Optional Contact Information */}
                  <div className="mb-8">
                    <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                      Email Address (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`w-full p-3 border ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                          : "border-gray-300 text-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      placeholder="your@email.com"
                    />
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
                      Share your email if you'd like us to follow up with you about your feedback.
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !feedbackText.trim()}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition
                      ${(isLoading || !feedbackText.trim()) 
                      ? darkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : darkMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
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
          <div className={`mt-10 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md p-6`}>
            <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-6`}>Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-2`}>How is my feedback used?</h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Your feedback helps us prioritize improvements and new features. We review all submissions and use them to guide our development roadmap.</p>
              </div>
              
              <div>
                <h3 className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-2`}>Will I receive a response to my feedback?</h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>If you provide your email address, we may reach out regarding specific issues or to get additional information. However, we cannot guarantee individual responses to all feedback.</p>
              </div>
              
              <div>
                <h3 className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-2`}>How can I report urgent issues?</h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>For time-sensitive matters or technical support, please select "Bug Report" as your feedback type and include "URGENT" in your message.</p>
              </div>
              
              <div>
                <h3 className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-2`}>Can I suggest new features?</h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Absolutely! We love hearing your ideas for new features. Select "Feature Request" as your feedback type and describe your suggestion in detail.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}