"use client";

import { useState } from "react";

export default function TeacherRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("http://localhost:5001/api/teachers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("🎉 Registration successful! Your 7-day Premium trial is active.");
        setFormData({ name: "", phone: "", email: "", bio: "" }); // Clear form
      } else {
        setStatus("error");
        setMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Could not connect to the server. Is your backend running on port 5001?");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-600">Tuto.lk</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Create your Teacher Profile</h2>
        <p className="mt-2 text-sm text-gray-600">
          Get your first 7 days of Premium visibility for free.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {status === "success" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium">
              {message}
            </div>
          )}

          {status === "error" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  placeholder="e.g. Ruwan Perera" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (WhatsApp)</label>
              <div className="mt-1">
                <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  placeholder="077 123 4567" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  placeholder="teacher@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Short Bio</label>
              <div className="mt-1">
                <textarea id="bio" name="bio" rows={3} required value={formData.bio} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  placeholder="Expert Combined Maths teacher..." />
              </div>
            </div>

            <div>
              <button type="submit" disabled={status === "loading"}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {status === "loading" ? "Registering..." : "Start 7-Day Free Trial"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}