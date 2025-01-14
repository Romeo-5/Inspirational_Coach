import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">Inspirational Coach</h1>
      <div className="space-y-4">
        <Link href="/journal">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Go to Journal</button>
        </Link>
        <Link href="/api/affirmations">
          <button className="px-4 py-2 bg-green-500 text-white rounded">Get Daily Affirmation</button>
        </Link>
        <Link href="/feedback">
          <button className="px-4 py-2 bg-purple-500 text-white rounded">Submit Feedback</button>
        </Link>
      </div>
    </div>
  );
}