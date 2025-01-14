"use client";

import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Journal() {
  const [entry, setEntry] = useState('');

  const saveEntry = async () => {
    await addDoc(collection(db, 'journal-entries'), {
      entry,
      timestamp: new Date(),
    });
    setEntry('');
  };

  return (
    <div>
      <h1>Guided Journaling</h1>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your thoughts..."
      />
      <button onClick={saveEntry}>Save Entry</button>
    </div>
  );
}