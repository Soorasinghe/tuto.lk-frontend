import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F4F7FA] px-6 text-center font-sans">
      <div className="text-6xl font-black text-blue-600 mb-4 tracking-tighter opacity-20">
        404
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
        Page Not Found
      </h2>
      
      <p className="text-gray-500 font-medium mb-8 max-w-md leading-relaxed">
        The tutor profile or page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link
        href="/"
        className="bg-[#0B1120] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-black transition shadow-md"
      >
        Return to Directory
      </Link>
    </div>
  );
}