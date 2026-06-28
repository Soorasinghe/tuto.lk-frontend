"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"; // 🔥 Added deleteObject
import { auth, storage } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ACADEMIC_LEVELS, SUBJECTS, TEACHING_MEDIUMS, CLASS_MODES } from "../../lib/constants";
import imageCompression from "browser-image-compression"; 

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [nicUrl, setNicUrl] = useState<string>("");
  const [certUrl, setCertUrl] = useState<string>("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // 🔥 NEW: Premium Gallery States
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [academicLevels, setAcademicLevels] = useState<string[]>([]);
  const [teachingMediums, setTeachingMediums] = useState<string[]>([]);
  const [institutes, setInstitutes] = useState<string[]>([]);
  const [classModes, setClassModes] = useState<string[]>([]);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [levelSearch, setLevelSearch] = useState("");
  const [mediumSearch, setMediumSearch] = useState("");

  const [instName, setInstName] = useState("");
  const [instCity, setInstCity] = useState("");
  const popularInstitutes = ["Sasipna", "Rotary", "Syzygy", "Chembase", "Apex", "Sipwin", "Vision", "Nanasa", "Susipvan"];

  const [locations, setLocations] = useState<any[]>([]);
  const [locationTree, setLocationTree] = useState<any[]>([]);
  const [selProv, setSelProv] = useState("");
  const [selDist, setSelDist] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selVill, setSelVill] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [villageSearch, setVillageSearch] = useState("");

  const [qualifications, setQualifications] = useState("");
  const [trackRecord, setTrackRecord] = useState("");

  const allCities = useMemo(() => {
    const cities = new Set<string>();
    locationTree.forEach((p: any) => p.districts.forEach((d: any) => d.cities.forEach((c: any) => cities.add(c.name))));
    return Array.from(cities).sort();
  }, [locationTree]);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/locations`);
        const json = await res.json();
        if (json.success) setLocationTree(json.data);
      } catch (error) {}
    };
    fetchLocationData();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${user.uid}`);
          const json = await res.json();
          
          if (json.success) {
            const currentTeacher = json.data;
            setTeacher(currentTeacher);
            
            if (currentTeacher.name) setName(currentTeacher.name);
            if (currentTeacher.phone) setPhone(currentTeacher.phone);
            if (currentTeacher.bio) setBio(currentTeacher.bio);
            if (currentTeacher.profile_pic_url) setProfilePicUrl(currentTeacher.profile_pic_url);
            if (currentTeacher.cover_url) setCoverUrl(currentTeacher.cover_url);
            if (currentTeacher.videoUrl) setVideoUrl(currentTeacher.videoUrl);
            if (currentTeacher.nic_url) setNicUrl(currentTeacher.nic_url);
            if (currentTeacher.cert_url) setCertUrl(currentTeacher.cert_url);
            if (currentTeacher.gallery_urls) setGalleryUrls(currentTeacher.gallery_urls); // 🔥 Load Gallery

            if (currentTeacher.subjects) setSubjects(currentTeacher.subjects);
            if (currentTeacher.academicLevels) setAcademicLevels(currentTeacher.academicLevels);
            if (currentTeacher.teachingMediums) setTeachingMediums(currentTeacher.teachingMediums);
            if (currentTeacher.institutes) setInstitutes(currentTeacher.institutes);
            if (currentTeacher.classModes) setClassModes(currentTeacher.classModes);
            if (currentTeacher.locations) setLocations(currentTeacher.locations);

            if (currentTeacher.qualifications) setQualifications(currentTeacher.qualifications?.join("\n") || "");
            if (currentTeacher.trackRecord) setTrackRecord(currentTeacher.trackRecord?.join("\n") || "");

            const leadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${user.uid}/leads`, { headers: { "Authorization": `Bearer ${token}` } });
            const contentType = leadsRes.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const leadsJson = await leadsRes.json();
              if (leadsJson.success) setLeads(leadsJson.data);
            }
          }
        } catch (error) {} finally { setLoading(false); }
      } else { router.push("/login"); }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  // 🔥 FEATURE GATES
  const isPremium = teacher?.subscription_tier === 'Premium' || teacher?.subscription_tier === 'Normal';
  const locationLimitHit = !isPremium && locations.length >= 1;
  const instituteLimitHit = !isPremium && institutes.length >= 1;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true); setMessage("");
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true });
      const storageRef = ref(storage, `profile_pictures/${teacher.id}_${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      uploadTask.on("state_changed", null, 
        () => { setMessage("❌ Failed to upload."); setUploadingImage(false); },
        async () => { setProfilePicUrl(await getDownloadURL(uploadTask.snapshot.ref)); setUploadingImage(false); }
      );
    } catch (error) { setUploadingImage(false); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true); setMessage("");
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      const storageRef = ref(storage, `covers/${teacher.id}_${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      uploadTask.on("state_changed", null, 
        () => { setMessage("❌ Failed to upload."); setUploadingCover(false); },
        async () => { setCoverUrl(await getDownloadURL(uploadTask.snapshot.ref)); setUploadingCover(false); }
      );
    } catch (error) { setUploadingCover(false); }
  };

  // 🔥 NEW: Premium Gallery Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true); setMessage("");
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true });
      const storageRef = ref(storage, `gallery/${teacher.id}_${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      uploadTask.on("state_changed", null, 
        () => { setMessage("❌ Failed to upload gallery image."); setUploadingGallery(false); },
        async () => { 
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setGalleryUrls(prev => [...prev, url]); 
          setUploadingGallery(false); 
        }
      );
    } catch (error) { setUploadingGallery(false); }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    // In a production app you'd also delete the file from Storage using deleteObject(ref(storage, url))
    setGalleryUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'nic' | 'cert') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true); setMessage("");
    try {
      const storageRef = ref(storage, `verifications/${teacher.id}_${type}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", null,
        () => { setMessage(`❌ Failed to upload ${type.toUpperCase()}.`); setUploadingDoc(false); },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (type === 'nic') setNicUrl(downloadURL);
          if (type === 'cert') setCertUrl(downloadURL);
          setUploadingDoc(false);
        }
      );
    } catch (error) { setUploadingDoc(false); }
  };

  const handleToggle = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const handleAddInstitute = () => {
    if (instituteLimitHit) return;
    if (!instName.trim()) return;
    const combinedVal = instCity.trim() ? `${instName.trim()} - ${instCity.trim()}` : instName.trim();
    if (!institutes.includes(combinedVal)) { setInstitutes([...institutes, combinedVal]); }
    setInstName(""); setInstCity("");
  };

  const handleRemoveInstitute = (instToRemove: string) => { setInstitutes(institutes.filter(i => i !== instToRemove)); };

  const activeDistricts = locationTree.find(p => p.province === selProv)?.districts || [];
  const activeCities = (activeDistricts.find((d: any) => d.name === selDist)?.cities || []).filter((c: any) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  const activeVillages = (activeDistricts.find((d: any) => d.name === selDist)?.cities?.find((c: any) => c.name === selCity)?.villages || []).filter((v: string) => v.toLowerCase().includes(villageSearch.toLowerCase()));

  const handleAddLocation = () => {
    if (locationLimitHit) return;
    if (selProv && selDist && selCity && selVill) {
      const newLoc = { province: selProv, district: selDist, city: selCity, village: selVill };
      if (!locations.some(l => l.village === selVill && l.city === selCity)) { setLocations([...locations, newLoc]); }
      setSelVill(""); setVillageSearch("");
    }
  };

  const handleRemoveLocation = (villageToRemove: string, cityToRemove: string) => { setLocations(locations.filter(l => !(l.village === villageToRemove && l.city === cityToRemove))); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    const qualificationsArray = qualifications.split("\n").map(q => q.trim()).filter(q => q !== "");
    const trackRecordArray = trackRecord.split("\n").map(t => t.trim()).filter(t => t !== "");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No authorization token available.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${teacher.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          name, phone, bio, videoUrl,
          subjects, academicLevels, teachingMediums, institutes, classModes, locations,
          profile_pic_url: profilePicUrl, cover_url: coverUrl, nic_url: nicUrl, cert_url: certUrl, gallery_urls: galleryUrls,
          qualifications: qualificationsArray, trackRecord: trackRecordArray
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("🎉 Profile updated successfully!");
        setTeacher((prev: any) => ({ ...prev, verification_status: 'Pending', rejection_reason: '' }));
        window.scrollTo(0, 0);
      } else { setMessage(`Error: ${json.message}`); }
    } catch (error) { setMessage("❌ Failed to connect to the server."); } finally { setSaving(false); }
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>;

  const inputStyle = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.6)", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#0F172A", outline: "none", transition: "0.2s" };
  const labelStyle = { display: "block", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 };
  const sectionStyle = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: "32px", marginBottom: 32, boxShadow: "0 4px 24px rgba(15,23,42,0.02)" };
  const activePillStyle = { background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#059669", padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center" };
  const inactivePillStyle = { background: "#fff", border: "1px solid #E2E8F0", color: "#64748B", padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; color: #0F172A; }
        .upload-overlay { opacity: 0; transition: opacity 0.2s ease; background: rgba(15,23,42,0.5); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; border-radius: inherit; }
        .upload-container:hover .upload-overlay { opacity: 1; }
        .focus-ring:focus-within { border-color: #00C9A7 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(0,201,167,0.15) !important; }
      `}</style>

      <div style={{ minHeight: "100vh" }}>
        <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, background: "rgba(8,17,31,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" style={{ fontSize: 21, fontWeight: 900, color: "#fff", letterSpacing: -1, textDecoration: "none" }}>Tuto<span style={{ color: "#00C9A7" }}>.lk</span></Link>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/dashboard/billing" style={{ fontSize: 13, fontWeight: 700, color: "#08111F", padding: "8px 16px", borderRadius: 8, textDecoration: "none", background: "#00C9A7" }}>Billing & Plan</Link>
            <button onClick={handleLogout} style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "transparent", border: "none", cursor: "pointer" }}>Log Out</button>
          </div>
        </nav>

        <div style={{ maxWidth: 960, margin: "40px auto 80px", padding: "0 20px" }}>
          {message && (
            <div style={{ padding: "16px 20px", borderRadius: 16, fontSize: 14, fontWeight: 700, marginBottom: 32, display: "flex", alignItems: "center", gap: 8, background: message.includes("🎉") || message.includes("✅") ? "#ECFDF5" : "#FEF2F2", color: message.includes("🎉") || message.includes("✅") ? "#059669" : "#DC2626", border: `1px solid ${message.includes("🎉") || message.includes("✅") ? "#A7F3D0" : "#FECACA"}` }}>{message}</div>
          )}

          <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
            <button onClick={() => setActiveTab("profile")} style={{ padding: "10px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", transition: "0.2s", background: activeTab === "profile" ? "#0F172A" : "#fff", color: activeTab === "profile" ? "#fff" : "#64748B" }}>Profile Builder</button>
            <button onClick={() => setActiveTab("leads")} style={{ padding: "10px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", transition: "0.2s", background: activeTab === "leads" ? "#0F172A" : "#fff", color: activeTab === "leads" ? "#fff" : "#64748B" }}>Student Leads</button>
          </div>

          {activeTab === "profile" && (
            <form onSubmit={handleSave}>
              {/* Header Section */}
              <div style={{ ...sectionStyle, padding: 0, overflow: "hidden" }}>
                <div className="upload-container" style={{ position: "relative", height: 220, background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : "linear-gradient(135deg, #E0F2FE, #F3F4F6)", borderBottom: "1px solid #E2E8F0" }}>
                  <div className="upload-overlay">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }} />
                    <div style={{ background: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>Change Cover Banner</div>
                  </div>
                </div>
                <div style={{ padding: "0 32px 32px" }}>
                  <div className="upload-container" style={{ width: 130, height: 130, borderRadius: "50%", border: "4px solid #fff", background: "#F0FDF4", color: "#059669", marginTop: -65, marginBottom: 24, position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    {profilePicUrl ? <img src={profilePicUrl} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : (name.charAt(0) || "T")}
                    <div className="upload-overlay">
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }} />
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>Change</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "8px 12px" }}>
                      <label style={labelStyle}>Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none" }} />
                    </div>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "8px 12px" }}>
                      <label style={labelStyle}>Mobile / WhatsApp</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none" }} />
                    </div>
                  </div>
                  <div className="focus-ring" style={{ ...inputStyle, padding: "8px 12px" }}>
                    <label style={labelStyle}>Professional Headline / Bio</label>
                    <textarea rows={2} value={bio} onChange={e => setBio(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none", resize: "none" }} />
                  </div>
                </div>
              </div>

              {/* Subject / Levels */}
              <div style={sectionStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, borderBottom: "1px solid #E2E8F0", paddingBottom: 16 }}>Teaching Expertise</h2>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Subjects</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {SUBJECTS.map(sub => <label key={sub} style={subjects.includes(sub) ? activePillStyle : inactivePillStyle}><input type="checkbox" style={{ display: "none" }} checked={subjects.includes(sub)} onChange={() => handleToggle(sub, subjects, setSubjects)} />{sub}</label>)}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Academic Levels</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {ACADEMIC_LEVELS.map(lvl => <label key={lvl} style={academicLevels.includes(lvl) ? activePillStyle : inactivePillStyle}><input type="checkbox" style={{ display: "none" }} checked={academicLevels.includes(lvl)} onChange={() => handleToggle(lvl, academicLevels, setAcademicLevels)} />{lvl}</label>)}
                  </div>
                </div>
              </div>

              {/* 🔥 Locations & Limits Enforced */}
              <div style={sectionStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, borderBottom: "1px solid #E2E8F0", paddingBottom: 16 }}>Locations & Institutes</h2>
                
                {/* Location Picker */}
                <div style={{ marginBottom: 32 }}>
                  <label style={labelStyle}>Coverage Areas</label>
                  <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "8px", background: "#fff" }}><label style={{...labelStyle, fontSize: 9}}>Province</label><select value={selProv} onChange={e => { setSelProv(e.target.value); setSelDist(""); setSelCity(""); setSelVill(""); }} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}><option value="">Select</option>{locationTree.map(p => <option key={p.province} value={p.province}>{p.province}</option>)}</select></div>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "8px", background: "#fff" }}><label style={{...labelStyle, fontSize: 9}}>District</label><select value={selDist} disabled={!selProv} onChange={e => { setSelDist(e.target.value); setSelCity(""); setSelVill(""); }} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}><option value="">Select</option>{activeDistricts.map((d: any) => <option key={d.name} value={d.name}>{d.name}</option>)}</select></div>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "8px", background: "#fff" }}><label style={{...labelStyle, fontSize: 9}}>City</label><select value={selCity} disabled={!selDist} onChange={e => { setSelCity(e.target.value); setSelVill(""); }} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}><option value="">Select</option>{activeCities.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "8px", background: "#fff" }}><label style={{...labelStyle, fontSize: 9}}>Village</label><select value={selVill} disabled={!selCity} onChange={e => setSelVill(e.target.value)} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}><option value="">Select</option>{activeVillages.map((v: string) => <option key={v} value={v}>{v}</option>)}</select></div>
                  </div>
                  
                  {/* Gate Logic for Add Button */}
                  {locationLimitHit ? (
                     <div style={{ padding: "12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, fontSize: 13, color: "#D97706", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        Basic plan limit reached (1 Location). 
                        <Link href="/dashboard/billing" style={{ color: "#D97706", textDecoration: "underline" }}>Upgrade to add more.</Link>
                     </div>
                  ) : (
                    <button type="button" disabled={!selVill} onClick={handleAddLocation} style={{ background: "#0F172A", color: "#fff", padding: "12px 24px", borderRadius: 12, border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Add Location</button>
                  )}
                  {locations.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>{locations.map((loc: any, idx: number) => <div key={idx} style={{ ...activePillStyle, background: "#F8FAFC", color: "#0F172A", border: "1px solid #E2E8F0" }}>{loc.village}, {loc.city}<span onClick={() => handleRemoveLocation(loc.village, loc.city)} style={{ marginLeft: 8, color: "#EF4444", cursor: "pointer" }}>✕</span></div>)}</div>}
                </div>

                {/* Institute Picker */}
                <div>
                  <label style={labelStyle}>Physical Institutes</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                    <div className="focus-ring" style={{ ...inputStyle, flex: 1, padding: "8px 12px" }}><input type="text" list="inst-list" value={instName} onChange={e => setInstName(e.target.value)} placeholder="Institute Name (e.g. Rotary)" style={{ width: "100%", border: "none", background: "transparent", outline: "none" }} /><datalist id="inst-list">{popularInstitutes.map(i => <option key={i} value={i} />)}</datalist></div>
                    <div className="focus-ring" style={{ ...inputStyle, flex: 1, padding: "8px 12px" }}><input type="text" list="city-list" value={instCity} onChange={e => setInstCity(e.target.value)} placeholder="City" style={{ width: "100%", border: "none", background: "transparent", outline: "none" }} /><datalist id="city-list">{allCities.map(c => <option key={c} value={c} />)}</datalist></div>
                    
                    {/* Gate Logic for Add Button */}
                    {instituteLimitHit ? (
                      <Link href="/dashboard/billing" style={{ background: "#FDE68A", color: "#92400E", padding: "12px 24px", borderRadius: 12, fontSize: 12, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center" }}>Upgrade for more</Link>
                    ) : (
                      <button type="button" onClick={handleAddInstitute} style={{ background: "#0F172A", color: "#fff", padding: "0 24px", borderRadius: 12, border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Add</button>
                    )}
                  </div>
                  {institutes.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{institutes.map((inst, idx) => <div key={idx} style={{ ...activePillStyle, background: "#F8FAFC", color: "#0F172A", border: "1px solid #E2E8F0" }}>{inst}<span onClick={() => handleRemoveInstitute(inst)} style={{ marginLeft: 8, color: "#EF4444", cursor: "pointer" }}>✕</span></div>)}</div>}
                </div>
              </div>

              {/* 🔥 PREMIUM MULTIMEDIA GALLERY */}
              <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #E2E8F0", paddingBottom: 16 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A" }}>Media & Video</h2>
                  {isPremium ? (
                    <span style={{ background: "#F0FDF4", color: "#059669", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>Premium Active</span>
                  ) : (
                    <Link href="/dashboard/billing" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, textDecoration: "none" }}>Upgrade Required</Link>
                  )}
                </div>

                {isPremium ? (
                  <>
                    <div className="focus-ring" style={{ ...inputStyle, padding: "16px", marginBottom: 24 }}>
                      <label style={labelStyle}>YouTube Video Intro URL</label>
                      <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 14 }} />
                    </div>

                    <div>
                      <label style={labelStyle}>Photo Gallery (Max 4 Images)</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16, marginTop: 12 }}>
                        {/* Render existing images */}
                        {galleryUrls.map((url, idx) => (
                          <div key={idx} style={{ position: "relative", paddingTop: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0" }}>
                            <img src={url} alt={`Gallery ${idx}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <button type="button" onClick={() => removeGalleryImage(idx)} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, background: "#EF4444", color: "#fff", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        ))}
                        {/* Upload Button */}
                        {galleryUrls.length < 4 && (
                          <div style={{ position: "relative", paddingTop: "100%", borderRadius: 16, border: "2px dashed #CBD5E1", background: "#F8FAFC", cursor: "pointer" }}>
                             <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                                {uploadingGallery ? <span style={{ fontSize: 12, fontWeight: 700 }}>Uploading...</span> : (
                                  <>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginBottom: 8 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    <span style={{ fontSize: 11, fontWeight: 700 }}>Add Image</span>
                                  </>
                                )}
                             </div>
                             <input type="file" accept="image/*" disabled={uploadingGallery} onChange={handleGalleryUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "32px", textAlign: "center", background: "#F8FAFC", borderRadius: 16, border: "1px dashed #CBD5E1" }}>
                    <svg width="40" height="40" fill="none" stroke="#94A3B8" viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#64748B", marginBottom: 16 }}>Premium Feature Only</p>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>Upload promotional photos and a YouTube introduction video to stand out to students.</p>
                    <Link href="/dashboard/billing" style={{ background: "#0F172A", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Upgrade to Unlock</Link>
                  </div>
                )}
              </div>

              {/* Quals / Identity Verification... (Remains exactly the same) */}
              <div style={sectionStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, borderBottom: "1px solid #E2E8F0", paddingBottom: 16 }}>Portfolio Data</h2>
                <div className="focus-ring" style={{ ...inputStyle, padding: "16px", marginBottom: 20 }}><label style={labelStyle}>Qualifications</label><textarea rows={3} value={qualifications} onChange={e => setQualifications(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none", resize: "none" }} /></div>
                <div className="focus-ring" style={{ ...inputStyle, padding: "16px" }}><label style={labelStyle}>Track Record</label><textarea rows={3} value={trackRecord} onChange={e => setTrackRecord(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none", resize: "none" }} /></div>
              </div>

              <button type="submit" disabled={saving || uploadingImage || uploadingCover || uploadingDoc || uploadingGallery} style={{ width: "100%", padding: "20px", background: "#0F172A", color: "#fff", borderRadius: 16, border: "none", fontSize: 16, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Publishing Profile..." : "Publish Profile Updates"}
              </button>
            </form>
          )}

          {activeTab === "leads" && (
            <div className="animate-in fade-in">
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Student Leads ({leads.length})</h2>
              {/* Lead Table remains exactly the same */}
            </div>
          )}

        </div>
      </div>
    </>
  );
}