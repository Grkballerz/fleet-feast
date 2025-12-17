'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
