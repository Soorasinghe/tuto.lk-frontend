"use client";

import { useState, useEffect } from "react";
import { auth } from "../../../lib/firebase"; 

interface LocationObject {
  province: string;
  district: string;
  city: string;
  village: string;
}

export default function TeacherLocationManager({ teacherId }: { teacherId: string }) {
  // Cascading Selection Tree States
  const [locationTree, setLocationTree] = useState<any[]>([]);
  const [selProv, setSelProv] = useState("");
  const [selDist, setSelDist] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selVill, setSelVill] = useState("");

  // Saved Locations for this specific Teacher
  const [savedLocations, setSavedLocations] = useState<LocationObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load configuration and data on render
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch the geography dataset tree (🌍 Public Route)
        const geoRes = await fetch("http://127.0.0.1:5001/api/teachers/locations");
        const geoJson = await geoRes.json();
        if (geoJson.success) setLocationTree(geoJson.data);

        // 🔥 Get secure token for fetching private data
        const token = await auth.currentUser?.getIdToken();

        // 2. Fetch the current teacher's saved locations (🔒 Protected Route)
        const profileRes = await fetch(`http://127.0.0.1:5001/api/teachers/${teacherId}`, {
          headers: { 
            "Authorization": `Bearer ${token}` // Attach ID Badge
          }
        });
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.data?.locations) {
          setSavedLocations(profileJson.data.locations);
        }
      } catch (error) {
        console.error("Failed to compile location parameters:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Slight delay to ensure Firebase Auth has initialized before fetching
    if (teacherId) {
      const timeoutId = setTimeout(() => fetchInitialData(), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [teacherId]);

  // Handle drilling filters
  const activeDistricts = locationTree.find(p => p.province === selProv)?.districts || [];
  const activeCities = activeDistricts.find((d: any) => d.name === selDist)?.cities || [];
  const activeVillages = activeCities.find((c: any) => c.name === selCity)?.villages || [];

  const handleAddLocation = () => {
    if (!selProv || !selDist || !selCity || !selVill) {
      alert("Please specify all parameters down to the local village level.");
      return;
    }

    const targetLocation: LocationObject = {
      province: selProv,
      district: selDist,
      city: selCity,
      village: selVill
    };

    // Prevent adding identical duplicates
    const isDuplicate = savedLocations.some(l => l.village === selVill);
    if (isDuplicate) {
      alert("This service area is already pinned to your profile.");
      return;
    }

    setSavedLocations([...savedLocations, targetLocation]);
    
    // Clear selections for quick sequential entries
    setSelProv(""); setSelDist(""); setSelCity(""); setSelVill("");
  };

  const handleRemoveLocation = (index: number) => {
    setSavedLocations(savedLocations.filter((_, idx) => idx !== index));
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      // 🔥 Generate fresh token right before saving
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Authentication token missing.");

      const res = await fetch(`http://127.0.0.1:5001/api/teachers/${teacherId}/profile`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Attach ID Badge
        },
        body: JSON.stringify({ locations: savedLocations })
      });
      const json = await res.json();
      if (json.success) {
        alert("Teaching operational zones updated successfully!");
      } else {
        alert("Server rejected the update.");
      }
    } catch (error) {
      alert("Failed to sync structural changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400 font-bold">Loading geographic fields...</div>;

  return (
    <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Teaching Locations</h3>
        <p className="text-sm text-gray-500 font-medium mt-0.5">Define your exact physical service circles. Students search for you matching their village.</p>
      </div>

      {/* Cascading Input selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Province</label>
          <select value={selProv} onChange={e => { setSelProv(e.target.value); setSelDist(""); setSelCity(""); setSelVill(""); }} className="w-full bg-transparent font-bold text-gray-900 outline-none cursor-pointer">
            <option value="">Select Province</option>
            {locationTree.map((p, i) => <option key={i} value={p.province}>{p.province}</option>)}
          </select>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">District</label>
          <select value={selDist} disabled={!selProv} onChange={e => { setSelDist(e.target.value); setSelCity(""); setSelVill(""); }} className="w-full bg-transparent font-bold text-gray-900 outline-none cursor-pointer disabled:opacity-40">
            <option value="">Select District</option>
            {activeDistricts.map((d: any, i: number) => <option key={i} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">City / DS Town</label>
          <select value={selCity} disabled={!selDist} onChange={e => { setSelCity(e.target.value); setSelVill(""); }} className="w-full bg-transparent font-bold text-gray-900 outline-none cursor-pointer disabled:opacity-40">
            <option value="">Select City</option>
            {activeCities.map((c: any, i: number) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Village / GN Division</label>
          <select value={selVill} disabled={!selCity} onChange={e => setSelVill(e.target.value)} className="w-full bg-transparent font-bold text-gray-900 outline-none cursor-pointer disabled:opacity-40">
            <option value="">Select Village</option>
            {activeVillages.map((v: string, i: number) => <option key={i} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <button type="button" onClick={handleAddLocation} className="bg-blue-600 text-white font-black text-sm px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
        + Link Service Zone
      </button>

      {/* Linked Locations List */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Active Operational Coverage ({savedLocations.length})</h4>
        
        {savedLocations.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium italic">No targeted zones added. Add at least one village to activate visibility in searches.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {savedLocations.map((loc, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm">
                <span>{loc.city} ({loc.village})</span>
                <button type="button" onClick={() => handleRemoveLocation(index)} className="text-slate-400 hover:text-red-400 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <button type="button" disabled={saving} onClick={handleSaveToDatabase} className="bg-emerald-500 text-white font-black px-8 py-3.5 rounded-xl hover:bg-emerald-600 transition shadow-md disabled:opacity-50">
          {saving ? "Syncing..." : "Commit Geographic Coverage"}
        </button>
      </div>
    </div>
  );
}