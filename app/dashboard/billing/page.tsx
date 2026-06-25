"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function BillingPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Billing States
  const [selectedTier, setSelectedTier] = useState<"Normal" | "Premium">("Premium");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 🔥 Generate secure token
          const token = await user.getIdToken();

          const res = await fetch(`http://127.0.0.1:5001/api/teachers/${user.uid}`, {
             headers: {
               "Authorization": `Bearer ${token}` // 🔒 Attach the ID Badge
             }
          });
          const json = await res.json();
          if (json.success) setTeacher(json.data);
        } catch (error) {
          console.error("Failed to fetch teacher data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    const storageRef = ref(storage, `receipts/${teacher.id}_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", null, 
      (error) => { console.error(error); alert("Upload failed."); setUploadingReceipt(false); },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setReceiptUrl(downloadURL);
        setUploadingReceipt(false);
      }
    );
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptUrl) {
      setMessage("Please upload your bank transfer slip.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      // 🔥 Generate fresh token right before submitting payment
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Authentication token missing.");

      const res = await fetch(`http://127.0.0.1:5001/api/subscriptions/manual`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🔒 Attach the ID Badge
        },
        body: JSON.stringify({ 
          teacherId: teacher.id,
          tier: selectedTier,
          receiptUrl: receiptUrl
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        setMessage("🎉 Payment submitted! An admin will verify your receipt and activate your plan shortly.");
        setReceiptUrl("");
      } else {
        setMessage(`Error: ${json.message}`);
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7FA]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-gray-900 pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">Tuto.lk</Link>
          <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="text-sm font-bold bg-amber-100 text-amber-800 px-4 py-2 rounded-xl border border-amber-200">
          Current Tier: {teacher?.subscription_tier || "Basic"}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Upgrade Your Plan</h1>
          <p className="text-lg text-gray-500 font-medium">Get more student leads and unlock premium profile features.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold mb-8 shadow-sm ${message.includes("🎉") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Normal Tier Card */}
          <div 
            onClick={() => setSelectedTier("Normal")}
            className={`cursor-pointer rounded-[2rem] p-8 border-2 transition-all ${selectedTier === "Normal" ? 'border-blue-600 shadow-[0_8px_30px_rgb(37,99,235,0.15)] bg-white' : 'border-gray-200 bg-gray-50 hover:border-blue-300'}`}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-2">Normal Tier</h3>
            <p className="text-gray-500 font-medium mb-6">Perfect for growing tutors.</p>
            <div className="text-4xl font-black text-blue-600 mb-6">LKR 990<span className="text-lg text-gray-400 font-bold">/mo</span></div>
            <ul className="space-y-3 text-sm font-bold text-gray-700">
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Middle Search Ranking</li>
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Up to 3 Villages & Institutes</li>
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Picture + Gallery Uploads</li>
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Profile Views Analytics</li>
            </ul>
          </div>

          {/* Premium Tier Card */}
          <div 
            onClick={() => setSelectedTier("Premium")}
            className={`cursor-pointer rounded-[2rem] p-8 border-2 relative transition-all ${selectedTier === "Premium" ? 'border-amber-500 shadow-[0_8px_30px_rgb(245,158,11,0.15)] bg-white' : 'border-gray-200 bg-gray-50 hover:border-amber-300'}`}
          >
            <div className="absolute -top-4 right-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">Most Popular</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Premium Tier</h3>
            <p className="text-gray-500 font-medium mb-6">Dominate your local area.</p>
            <div className="text-4xl font-black text-amber-500 mb-6">LKR 1990<span className="text-lg text-gray-400 font-bold">/mo</span></div>
            <ul className="space-y-3 text-sm font-bold text-gray-700">
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Top Search Ranking</li>
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Unlimited Villages & Institutes</li>
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Picture, Gallery + Video Intro</li>
              <li className="flex gap-3"><svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Views, Clicks & Leads Tracked</li>
            </ul>
          </div>
        </div>

        {/* Manual Payment Submission Form */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Manual Bank Transfer</h2>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-black text-blue-800 uppercase tracking-widest mb-4">Our Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold text-blue-900">
              <div><span className="text-blue-600 block text-xs">Bank Name</span>Commercial Bank</div>
              <div><span className="text-blue-600 block text-xs">Branch</span>Bandarawela</div>
              <div><span className="text-blue-600 block text-xs">Account Name</span>Tuto.lk Tech (Pvt) Ltd</div>
              <div><span className="text-blue-600 block text-xs">Account Number</span>1234 5678 9101</div>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment}>
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Deposit Slip / Screenshot</label>
              <div className="flex items-center gap-6">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleReceiptUpload} 
                  required={!receiptUrl}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer transition"
                />
                {uploadingReceipt && <span className="text-sm font-bold text-blue-600 animate-pulse whitespace-nowrap">Uploading...</span>}
              </div>
              {receiptUrl && (
                <div className="mt-4 inline-block px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold">
                  ✓ Slip Uploaded Successfully
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting || uploadingReceipt || !receiptUrl}
              className="w-full bg-[#0F172A] text-white font-black text-lg py-5 rounded-[1.5rem] hover:bg-black transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] disabled:opacity-50"
            >
              {submitting ? "Submitting Payment..." : `Submit ${selectedTier} Plan Payment`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}