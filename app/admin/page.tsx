"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";

export default function SuperAdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [stats, setStats] = useState({
    totalTeachers: 0,
    premiumCount: 0,
    pendingVerifications: 0,
    monthlyRevenue: "LKR 0"
  });

  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  
  const [adTitle, setAdTitle] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adPlacement, setAdPlacement] = useState("Top");
  const [uploadingAd, setUploadingAd] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await fetch(`${API_URL}/api/teachers/${user.uid}`, { cache: 'no-store' });
          const json = await res.json();
          
          if (json.success && json.data.role === "admin") {
            setAuthorized(true);
          } else {
            setAuthorized(false);
            window.location.href = "/dashboard"; 
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          setAuthorized(false);
          window.location.href = "/login";
        }
      } else {
        setAuthorized(false);
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, [API_URL]);

  useEffect(() => {
    if (!authorized) return;

    const fetchAdminData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("No authorization token found.");

        const safeFetch = async (endpoint: string) => {
          const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 
              "Authorization": `Bearer ${token}` 
            }
          });
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error(`🚨 Backend Error at ${endpoint}:`, text);
            return { success: false };
          }
        };

        const statsJson = await safeFetch("/api/admin/stats");
        if (statsJson.success && statsJson.data) setStats(statsJson.data);

        const queueJson = await safeFetch("/api/admin/pending");
        if (queueJson.success && queueJson.data) setPendingTeachers(queueJson.data);

        const paymentsJson = await safeFetch("/api/subscriptions/pending");
        if (paymentsJson.success && paymentsJson.data) setPendingPayments(paymentsJson.data);

        const adsRes = await safeFetch("/api/ads/all");
        if (adsRes.success && adsRes.data) setAds(adsRes.data);

        const teachersJson = await safeFetch("/api/admin/teachers");
        if (teachersJson.success && teachersJson.data) setAllTeachers(teachersJson.data);

      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [authorized, API_URL]);

  const handleApproveTeacher = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/admin/approve/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setPendingTeachers(pendingTeachers.filter(t => t.id !== id));
        setStats({ ...stats, pendingVerifications: Math.max(0, stats.pendingVerifications - 1) });
        
        setAllTeachers(allTeachers.map(t => t.id === id ? { ...t, is_verified: true } : t));
        alert("Teacher verified and live on platform!");
      }
    } catch (error) {
      alert("Failed to verify teacher.");
    }
  };

  const handleRejectTeacher = async (id: string) => {
    const reason = prompt("Enter the reason for rejecting this tutor (e.g., 'ID photo unclear'):");
    if (!reason || !reason.trim()) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/admin/reject/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ reason })
      });
      const json = await res.json();
      if (json.success) {
        setPendingTeachers(pendingTeachers.filter(t => t.id !== id));
        setStats({ ...stats, pendingVerifications: Math.max(0, stats.pendingVerifications - 1) });
        alert("Application rejected and logged.");
      } else {
        alert("Failed to reject application: " + json.message);
      }
    } catch (error) {
      alert("Failed to reject application.");
    }
  };

  const handleApprovePayment = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/subscriptions/approve/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setPendingPayments(pendingPayments.filter(p => p.id !== id));
        
        // Refresh teacher list to show new subscription dates
        const teachersJson = await fetch(`${API_URL}/api/admin/teachers`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json());
        if (teachersJson.success) setAllTeachers(teachersJson.data);
        
        alert("Payment Approved! Teacher has been upgraded successfully for 30 days.");
      }
    } catch (error) {
      alert("Failed to approve payment.");
    }
  };

  // 🔥 NEW: Handle Rejecting a Payment Slip
  const handleRejectPayment = async (id: string) => {
    const reason = prompt("Enter the reason for rejecting this payment (e.g., 'Slip is blurry', 'Date invalid'):");
    if (!reason || !reason.trim()) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/subscriptions/reject/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ reason })
      });
      const json = await res.json();
      if (json.success) {
        setPendingPayments(pendingPayments.filter(p => p.id !== id));
        alert("Payment slip rejected.");
      } else {
        alert("Failed to reject payment: " + json.message);
      }
    } catch (error) {
      alert("Failed to reject payment.");
    }
  };

  // Update Tier AND Handle Un-Verifying from the Management Table
  const handleUpdateStatus = async (id: string, field: 'subscription_tier' | 'is_verified', value: any) => {
    if (field === 'is_verified' && value === false) {
      if (!confirm("Are you sure you want to revoke this teacher's verified status?")) return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/admin/teachers/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      const json = await res.json();
      if (json.success) {
        setAllTeachers(allTeachers.map(t => t.id === id ? { ...t, [field]: value } : t));
        alert("Teacher updated successfully.");
      }
    } catch (error) {
      alert("Failed to modify teacher.");
    }
  };

  const handleUploadAd = async (e: React.FormEvent, fileInput: HTMLInputElement | null) => {
    e.preventDefault();
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a banner image.");
      return;
    }
    const file = fileInput.files[0];
    setUploadingAd(true);
    const storageRef = ref(storage, `ads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on("state_changed", null,
      (error) => { console.error(error); alert("Upload failed."); setUploadingAd(false); },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          const token = await auth.currentUser?.getIdToken();
          const res = await fetch(`${API_URL}/api/ads/create`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ 
              title: adTitle, 
              linkUrl: adLink, 
              imageUrl: downloadURL, 
              isActive: true,
              placement: adPlacement 
            })
          });
          const json = await res.json();
          if (json.success) {
            alert(`New ${adPlacement} Banner Launched!`);
            setAdTitle("");
            setAdLink("");
            fileInput.value = "";
            
            const updatedAds = await fetch(`${API_URL}/api/ads/all`, {
              headers: { "Authorization": `Bearer ${token}` }
            }).then(r => r.json());
            
            if (updatedAds.success) setAds(updatedAds.data);
          }
        } catch (error) {
          alert("Failed to save ad to database.");
        } finally {
          setUploadingAd(false);
        }
      }
    );
  };

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "verifications", label: "Verification Queue", badge: pendingTeachers.length, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "revenue", label: "Billing & Revenue", badge: pendingPayments.length, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "teachers", label: "Teacher Management", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "ads", label: "Ad Slot Management", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" }
  ];

  if (authorized === null) {
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white font-black text-2xl tracking-tighter">Checking access...</div>;
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white font-black text-2xl tracking-tighter">Loading Tuto.lk Control Center...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-[#0B1120] text-slate-400 flex flex-col shadow-2xl z-20 relative shrink-0">
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg">T</span>
            Tuto.lk <span className="text-[10px] uppercase tracking-widest text-blue-400 ml-1 font-bold">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                {item.label}
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === item.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white px-10 py-6 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Live
            </span>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
                  <h3 className="text-gray-600 font-bold text-sm mb-1">Total Active Teachers</h3>
                  <p className="text-4xl font-black text-gray-900">{stats.totalTeachers}</p>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"></path></svg></div>
                  <h3 className="text-gray-600 font-bold text-sm mb-1">Premium Subscriptions</h3>
                  <p className="text-4xl font-black text-gray-900">{stats.premiumCount}</p>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                  <h3 className="text-gray-600 font-bold text-sm mb-1">Pending Action</h3>
                  <p className="text-4xl font-black text-gray-900">{pendingTeachers.length + pendingPayments.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFICATION QUEUE */}
          {activeTab === "verifications" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Pending Approvals</h2>
                    <p className="text-sm text-gray-500 font-medium">Review NIC and Educational Certificates before approving.</p>
                  </div>
                </div>
                {pendingTeachers.length === 0 ? (
                  <div className="p-16 text-center text-gray-500 font-bold">Queue is empty.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
                          <th className="px-8 py-5 font-bold">Teacher Name</th>
                          <th className="px-8 py-5 font-bold">Documents</th>
                          <th className="px-8 py-5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingTeachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5 font-black text-gray-900">{teacher.name}</td>
                            <td className="px-8 py-5">
                              <div className="flex gap-3">
                                {teacher.nic_url ? (
                                  <a href={teacher.nic_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition">View NIC</a>
                                ) : (
                                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">NIC Missing</span>
                                )}
                                {teacher.cert_url ? (
                                  <a href={teacher.cert_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition">View Certificate</a>
                                ) : (
                                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">Cert Missing</span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right flex justify-end gap-2">
                              <button onClick={() => handleRejectTeacher(teacher.id)} className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 border border-red-200 transition shadow-sm">Reject</button>
                              <button onClick={() => handleApproveTeacher(teacher.id)} className="text-sm font-bold text-white bg-emerald-500 px-4 py-2 rounded-xl hover:bg-emerald-600 transition shadow-sm">Approve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & REVENUE */}
          {activeTab === "revenue" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Pending Payment Approvals</h2>
                    <p className="text-sm text-gray-500 font-medium">Verify the bank slip against your Commercial Bank app, then approve the tier upgrade.</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase border border-amber-200">
                    {pendingPayments.length} Pending
                  </span>
                </div>
                {pendingPayments.length === 0 ? (
                  <div className="p-16 text-center text-gray-500 font-bold">No pending payments.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
                          <th className="px-8 py-5 font-bold">Teacher Name</th>
                          <th className="px-8 py-5 font-bold">Requested Tier</th>
                          <th className="px-8 py-5 font-bold">Date Submitted</th>
                          <th className="px-8 py-5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5 font-black text-gray-900">{payment.teacher_name}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${payment.tier === 'Premium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                                {payment.tier}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-gray-600">{payment.date}</td>
                            <td className="px-8 py-5 text-right flex justify-end gap-2">
                              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm">
                                View Slip
                              </a>
                              {/* 🔥 NEW: Reject Payment Button */}
                              <button onClick={() => handleRejectPayment(payment.id)} className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 border border-red-200 transition shadow-sm">
                                Reject
                              </button>
                              <button onClick={() => handleApprovePayment(payment.id)} className="text-sm font-bold text-white bg-emerald-500 px-4 py-2 rounded-xl hover:bg-emerald-600 transition shadow-sm">
                                Approve 
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AD SLOT MANAGEMENT */}
          {activeTab === "ads" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-8 mb-8">
                <h2 className="text-xl font-black text-gray-900 mb-2">Launch New Banner Campaign</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">Select the placement area. Uploading will automatically activate the banner.</p>
                <form
                  onSubmit={(e) => {
                    const fileInput = document.getElementById('ad-image-upload') as HTMLInputElement;
                    handleUploadAd(e, fileInput);
                  }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Sponsor / Campaign Title</label>
                      <input type="text" required value={adTitle} onChange={e => setAdTitle(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 shadow-sm" 
                        placeholder="e.g., Sakya Institute Dec Intake" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Ad Placement</label>
                      <select required value={adPlacement} onChange={e => setAdPlacement(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 cursor-pointer shadow-sm">
                        <option value="Top">Top Banner (1200x250)</option>
                        <option value="Sidebar">Sidebar Banner (600x500)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Target Link (URL)</label>
                    <input type="url" required value={adLink} onChange={e => setAdLink(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 shadow-sm" 
                      placeholder="https://..." />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Banner Image</label>
                    <input id="ad-image-upload" type="file" accept="image/*" required 
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl bg-white shadow-sm" />
                  </div>
                  
                  <button type="submit" disabled={uploadingAd} className="bg-[#0B1120] hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl shadow-md disabled:opacity-50 mt-4 transition">
                    {uploadingAd ? "Uploading..." : "Publish Banner"}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-black text-gray-900">Campaign History</h2>
                </div>
                <div className="p-8">
                  {ads.length === 0 ? (
                    <p className="text-gray-500 font-medium text-center">No ads uploaded yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {ads.map((ad) => (
                        <div key={ad.id} className={`flex flex-col rounded-2xl border overflow-hidden ${ad.isActive ? 'border-emerald-300 bg-emerald-50/20 shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                          
                          <div className="w-full h-40 bg-gray-100 border-b border-gray-200 relative overflow-hidden flex items-center justify-center">
                            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover object-center" />
                            {!ad.isActive && (
                              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-gray-800 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">Archived</span>
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {ad.isActive && <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">Live Now</span>}
                              {ad.placement && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">{ad.placement} Ad</span>}
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-auto shrink-0">
                                {ad.created_at ? new Date(ad.created_at._seconds * 1000).toLocaleDateString() : "Recent"}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-black text-gray-900 truncate mb-1" title={ad.title}>{ad.title}</h3>
                            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline truncate block" title={ad.linkUrl}>{ad.linkUrl}</a>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TEACHER MANAGEMENT DIRECTORY */}
          {activeTab === "teachers" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-black text-gray-900">Platform Tutors Directory</h2>
                  <p className="text-sm text-gray-500 font-medium">Manually override tiers, adjust verification variables, or audit system profiles.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
                        <th className="px-8 py-5 font-bold">Tutor Meta Details</th>
                        <th className="px-8 py-5 font-bold">Registration</th>
                        <th className="px-8 py-5 font-bold">Trial / Subscription Expiry</th>
                        <th className="px-8 py-5 font-bold text-right">Access Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allTeachers.map((t) => {
                        // Backend now sends perfectly formatted ISO strings
                        const regDate = t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A';
                        
                        const isSub = !!t.subscription_ends_at;
                        const expiryRaw = isSub ? t.subscription_ends_at : t.trial_ends_at;
                          
                        const expiryDate = expiryRaw ? new Date(expiryRaw).toLocaleDateString() : 'N/A';
                        const isExpired = expiryRaw ? new Date() > new Date(expiryRaw) : false;

                        return (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <p className="font-black text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">{t.email}</p>
                              <p className="text-xs text-gray-500 font-medium">{t.phone}</p>
                            </td>
                            <td className="px-8 py-5 text-sm font-semibold text-gray-600">
                              {regDate}
                            </td>
                            <td className="px-8 py-5">
                              <span className={`text-sm font-bold ${isExpired ? "text-red-500" : "text-emerald-600"}`}>
                                {expiryDate}
                              </span>
                              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {isSub ? 'Paid Subs.' : '7-Day Trial'}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col items-end gap-2">
                                <select
                                  value={t.subscription_tier}
                                  onChange={(e) => handleUpdateStatus(t.id, 'subscription_tier', e.target.value)}
                                  className="bg-white border border-gray-300 text-gray-900 font-bold text-sm rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm"
                                >
                                  <option value="Basic">Basic (Free)</option>
                                  <option value="Normal">Normal</option>
                                  <option value="Premium">Premium</option>
                                </select>
                                
                                {t.is_verified ? (
                                  <button onClick={() => handleUpdateStatus(t.id, 'is_verified', false)} className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-lg transition">
                                    Revoke Verif.
                                  </button>
                                ) : (
                                  <button onClick={() => handleUpdateStatus(t.id, 'is_verified', true)} className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition">
                                    Verify Tutor
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}