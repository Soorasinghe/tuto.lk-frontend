"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In the future, you can connect this to Sentry or Datadog to track errors
    console.error("Caught by Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F4F7FA] px-6 text-center font-sans">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
        Oops! Something went wrong.
      </h2>
      
      <p className="text-gray-500 font-medium mb-8 max-w-md leading-relaxed">
        We encountered an unexpected error on our end. Please try refreshing the page or navigating back home.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()} // This automatically tries to re-render the segment that crashed
          className="bg-[#0B1120] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-black transition shadow-md"
        >
          Try Again
        </button>
        
        <Link
          href="/"
          className="bg-white border border-gray-300 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}