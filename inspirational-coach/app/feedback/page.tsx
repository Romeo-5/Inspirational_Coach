"use client"

import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Feedback() {
  const [feedback, setFeedback] = useState('');

  const submitFeedback = async () => {
    await addDoc(collection(db, 'feedback'), {
      feedback,
      timestamp: new Date(),
    });
    setFeedback('');
  };

  return (
    <div>
      <h1>Feedback</h1>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your feedback..."
      />
      <button onClick={submitFeedback}>Submit Feedback</button>
    </div>
  );
}