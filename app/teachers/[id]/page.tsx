"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PremiumTeacherProfile() {
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lead Generation States
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [unlockedPhone, setUnlockedPhone] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  // 🔥 Dynamically grab the API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/teachers/${teacherId}`);
        const json = await res.json();
        if (json.success) setTeacher(json.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (teacherId) fetchTeacherProfile();
  }, [teacherId, apiUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const formatWhatsAppUrl = (phone: string, teacherName: string) => {
    if (!phone) return "#";
    let cleanNumber = phone.replace(/\D/g, "");
    if (cleanNumber.startsWith("0") && cleanNumber.length === 10) {
      cleanNumber = "94" + cleanNumber.substring(1);
    }
    const message = encodeURIComponent(`Hello ${teacherName}, I found your premium profile on Tuto.lk and would like to inquire about your classes.`);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError("");

    try {
      const res = await fetch(`${apiUrl}/api/teachers/${teacherId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, grade: studentGrade }),
      });
      const json = await res.json();
      if (json.success) setUnlockedPhone(json.phone);
      else setUnlockError(json.message || "Failed to unlock contact.");
    } catch (error) {
      setUnlockError("Network error. Please try again.");
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#6B7280", background: "#F6F7FA" }}>Loading Premium Profile...</div>;
  if (!teacher) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#EF4444", background: "#F6F7FA" }}>Tutor not found.</div>;

  const embedUrl = getYouTubeEmbedUrl(teacher.videoUrl);

  const sectionStyle = {
    background: "#fff", border: "1px solid #E5E7EB", borderRadius: 20,
    padding: "32px", marginBottom: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.02)"
  };
  const labelStyle = {
    display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: "#6B7280",
    textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 16
  };
  const pillStyle = {
    background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0A0F1E",
    padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center"
  };
  const inputStyle = {
    width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.6)",
    border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 14, fontWeight: 600,
    color: "#0A0F1E", outline: "none", fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s"
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #F6F7FA; color: #0A0F1E; }
        
        @media (max-width: 900px) {
          .main-layout { flex-direction: column !important; }
          .sidebar-col { width: 100% !important; position: static !important; }
          .hero-flex { flex-direction: column !important; align-items: center !important; text-align: center !important; }
        }
        
        .focus-ring:focus-within { border-color: #38BDF8 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(56,189,248,0.15) !important; }
      `}</style>

      <div style={{ minHeight: "100vh" }}>
        
        {/* ── NAV (Matching Homepage) ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", height: 60, background: "rgba(10,15,30,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -1, textDecoration: "none" }}>
            Tuto<span style={{ color: "#38BDF8" }}>.lk</span>
          </Link>
          <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Search
          </Link>
        </nav>

        <div style={{ maxWidth: 1200, margin: "40px auto 80px", padding: "0 20px" }}>
          
          {/* ── LINKEDIN STYLE HERO CARD ── */}
          <div style={{ ...sectionStyle, padding: 0, overflow: "hidden" }}>
            
            {/* Cover Area */}
            <div style={{ 
              position: "relative", 
              height: 280, 
              backgroundImage: teacher.cover_url ? `url('${teacher.cover_url}')` : "linear-gradient(135deg, #E0F2FE, #F3F4F6)", 
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              borderBottom: "1px solid #E5E7EB" 
            }}>
            </div>

            {/* Info Area with Overlapping Avatar */}
            <div className="hero-flex" style={{ padding: "0 40px 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginTop: -65 }}>
              
              <div className="hero-flex" style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
                <div style={{
                  width: 140, height: 140, borderRadius: "50%", border: "4px solid #fff", background: "#EFF6FF", color: "#2563EB",
                  position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 900,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)", flexShrink: 0
                }}>
                  {teacher.profile_pic_url ? <img src={teacher.profile_pic_url} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : (teacher.name.charAt(0))}
                  {teacher.is_verified && (
                    <div style={{ position: "absolute", bottom: 4, right: 4, width: 28, height: 28, background: "#10B981", border: "4px solid #fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                </div>

                <div style={{ paddingBottom: 8 }}>
                  <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0A0F1E", letterSpacing: -1, marginBottom: 8, lineHeight: 1.1 }}>{teacher.name}</h1>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#6B7280" }}>{teacher.subjects?.join(" • ") || "Professional Tutor"}</p>
                </div>
              </div>

              <button onClick={handleCopyLink} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: copied ? "#10B981" : "#0A0F1E", fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
              }}>
                {copied ? "Link Copied!" : (
                  <><svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> Share Profile</>
                )}
              </button>
            </div>
          </div>

          {/* ── TWO COLUMN MAIN LAYOUT ── */}
          <div className="main-layout" style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
            
            {/* LEFT COLUMN: Main Content */}
            <main style={{ flex: "1 1 68%", minWidth: 0 }}>
              
              {/* About Section */}
              {teacher.bio && (
                <div style={sectionStyle}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0A0F1E", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#38BDF8" }}><svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
                    About The Tutor
                  </h2>
                  <p style={{ color: "#374151", fontSize: 15, fontWeight: 500, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{teacher.bio}</p>
                </div>
              )}

              {/* Services & Expertise Grid */}
              <div style={sectionStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0A0F1E", borderBottom: "1px solid #E5E7EB", paddingBottom: 16, marginBottom: 24 }}>Teaching Profile</h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
                  <div>
                    <div style={labelStyle}>
                      <span style={{ color: "#F59E0B" }}>📚</span> Academic Levels
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {teacher.academicLevels?.length > 0 ? teacher.academicLevels.map((lvl: string) => (
                        <span key={lvl} style={{...pillStyle, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#D97706"}}>{lvl}</span>
                      )) : <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>Not specified</span>}
                    </div>
                  </div>

                  <div>
                    <div style={labelStyle}>
                      <span style={{ color: "#38BDF8" }}>📍</span> Coverage Areas
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {teacher.locations?.length > 0 ? teacher.locations.map((loc: any, idx: number) => (
                        <span key={idx} style={pillStyle}>{loc.village || loc.city || loc.district}</span>
                      )) : <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>Not specified</span>}
                    </div>
                  </div>

                  <div>
                    <div style={labelStyle}>
                      <span style={{ color: "#8B5CF6" }}>🏫</span> Institutes
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {teacher.institutes?.length > 0 ? teacher.institutes.map((inst: string) => (
                        <span key={inst} style={{...pillStyle, background: "#F5F3FF", border: "1px solid #EDE9FE", color: "#6D28D9"}}>{inst}</span>
                      )) : <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>No institutes specified</span>}
                    </div>
                  </div>

                  <div>
                    <div style={labelStyle}>
                      <span style={{ color: "#10B981" }}>🗣️</span> Teaching Medium
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {teacher.teachingMediums?.length > 0 ? teacher.teachingMediums.map((med: string) => (
                        <span key={med} style={{...pillStyle, background: "#ECFDF5", border: "1px solid #D1FAE5", color: "#047857"}}>{med}</span>
                      )) : <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>Not specified</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PORTFOLIO & TRACK RECORD (ALWAYS VISIBLE, LINKEDIN STYLE) ── */}
              <div style={sectionStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0A0F1E", borderBottom: "1px solid #E5E7EB", paddingBottom: 16, marginBottom: 24 }}>Portfolio & Achievements</h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
                  
                  {/* Qualifications */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FFFBEB", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #FDE68A", flexShrink: 0 }}>
                        <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0A0F1E" }}>Academic Qualifications</h3>
                    </div>
                    
                    {teacher.qualifications?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {teacher.qualifications.map((q: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F9FAFB", padding: "16px", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", marginTop: 8, flexShrink: 0 }}></div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", lineHeight: 1.6 }}>{q}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "16px", borderRadius: 12, border: "1px dashed #D1D5DB", background: "#F9FAFB" }}>
                        <p style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", textAlign: "center" }}>No qualifications listed by this tutor.</p>
                      </div>
                    )}
                  </div>

                  {/* Track Record */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", color: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #DBEAFE", flexShrink: 0 }}>
                        <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0A0F1E" }}>Track Record & Experience</h3>
                    </div>
                    
                    {teacher.trackRecord?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {teacher.trackRecord.map((t: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F9FAFB", padding: "16px", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", marginTop: 8, flexShrink: 0 }}></div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", lineHeight: 1.6 }}>{t}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "16px", borderRadius: 12, border: "1px dashed #D1D5DB", background: "#F9FAFB" }}>
                        <p style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", textAlign: "center" }}>No track record listed by this tutor.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Embed */}
              {embedUrl && (
                <div style={{ background: "#0A0F1E", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#EF4444" }}><svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></span>
                      Watch Introduction
                    </h3>
                  </div>
                  <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
                    <iframe 
                      src={embedUrl} title="Tutor Introduction" frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    ></iframe>
                  </div>
                </div>
              )}
            </main>

            {/* RIGHT COLUMN: Contact Widget */}
            <aside className="sidebar-col" style={{ flex: "1 1 32%", minWidth: 320, position: "sticky", top: 100 }}>
              <div style={sectionStyle}>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8, lineHeight: 1.1 }}>Start Learning with {teacher.name.split(' ')[0]}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginBottom: 24 }}>Get in touch directly to schedule your first class.</p>
                
                <div style={{ marginBottom: 24 }}>
                  <div style={labelStyle}>Available Formats</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {teacher.classModes?.length > 0 ? teacher.classModes.map((mode: string) => (
                      <div key={mode} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F9FAFB", padding: 12, borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 14, fontWeight: 700, color: "#0A0F1E" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        {mode}
                      </div>
                    )) : <div style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>Not specified</div>}
                  </div>
                </div>

                <button onClick={() => setShowContact(true)} style={{
                  width: "100%", background: "#0A0F1E", color: "#fff", padding: "16px", borderRadius: 16, border: "none",
                  fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
                  transition: "0.2s", boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
                }} onMouseEnter={e => e.currentTarget.style.background = "#1a2340"} onMouseLeave={e => e.currentTarget.style.background = "#0A0F1E"}>
                  <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  View Contact Info
                </button>
                
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  100% Free for Students
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── BOOKING MODAL ── */}
        {showContact && (
           <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
              <div style={{ background: "#fff", borderRadius: 24, padding: 40, width: "100%", maxWidth: 450, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", position: "relative" }}>
                
                <div style={{ width: 56, height: 56, background: "#EFF6FF", color: "#2563EB", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid #DBEAFE" }}>
                   <svg style={{ width: 28, height: 28 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                
                {!unlockedPhone ? (
                  <>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>Unlock Contact Info</h3>
                    <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginBottom: 24, lineHeight: 1.5 }}>Enter your details to securely view the tutor's direct phone number.</p>
                    
                    {unlockError && <p style={{ color: "#DC2626", fontSize: 13, fontWeight: 800, background: "#FEF2F2", padding: 12, borderRadius: 12, border: "1px solid #FECACA", marginBottom: 16 }}>{unlockError}</p>}

                    <form onSubmit={handleUnlock}>
                      <div className="focus-ring" style={{ ...inputStyle, marginBottom: 16 }}>
                        <label style={labelStyle}>Student Name</label>
                        <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g., Kamal Perera" style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 15, fontWeight: 700, color: "#0A0F1E" }} />
                      </div>
                      
                      <div className="focus-ring" style={{ ...inputStyle, marginBottom: 24 }}>
                        <label style={labelStyle}>Grade / Year</label>
                        <select required value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 15, fontWeight: 700, color: "#0A0F1E", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                          <option value="">Select Grade</option>
                          <option value="A/L">A/L</option>
                          <option value="O/L">O/L</option>
                          <option value="Grade 6-9">Grade 6-9</option>
                        </select>
                      </div>
                      
                      <button type="submit" disabled={unlocking} style={{
                        width: "100%", background: "#0A0F1E", color: "#fff", padding: "16px", borderRadius: 16, border: "none",
                        fontSize: 15, fontWeight: 800, cursor: unlocking ? "not-allowed" : "pointer", opacity: unlocking ? 0.7 : 1, transition: "0.2s"
                      }} onMouseEnter={e => e.currentTarget.style.background = "#1a2340"} onMouseLeave={e => e.currentTarget.style.background = "#0A0F1E"}>
                        {unlocking ? "Unlocking..." : "Reveal Contact Info"}
                      </button>
                    </form>
                    
                    <button onClick={() => setShowContact(false)} style={{ width: "100%", background: "transparent", border: "none", color: "#6B7280", fontSize: 14, fontWeight: 800, marginTop: 16, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ display: "inline-block", background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 12px", borderRadius: 100, marginBottom: 16 }}>Verified Unlock</span>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0A0F1E", marginBottom: 8 }}>Contact Unlocked!</h3>
                    <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginBottom: 24 }}>Connect with {teacher.name.split(' ')[0]} instantly via WhatsApp or direct call.</p>
                    
                    <a href={formatWhatsAppUrl(unlockedPhone, teacher.name)} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", justifyContent: "center", alignItems: "center", gap: 10, width: "100%", background: "#25D366", color: "#fff", padding: "16px", borderRadius: 16, textDecoration: "none", fontSize: 16, fontWeight: 800, marginBottom: 16, transition: "0.2s", boxShadow: "0 8px 24px rgba(37,211,102,0.3)"
                    }}>
                      <svg style={{ width: 24, height: 24, fill: "currentColor" }} viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.638-1.023-5.118-2.884-6.98-1.862-1.862-4.343-2.887-6.984-2.889-5.439 0-9.865 4.426-9.87 9.87-.001 1.516.406 3.002 1.18 4.3l-.994 3.636 3.719-.976zm11.233-6.126c-.3-.149-1.772-.874-2.046-.974-.275-.101-.475-.149-.675.149-.2.299-.775.974-.95 1.174-.175.2-.35.224-.65.075-1.122-.562-1.924-.963-2.68-2.274-.202-.349-.071-.537.079-.687.135-.135.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.374-.025-.524-.075-.15-.675-1.623-.925-2.222-.243-.584-.489-.505-.675-.514-.175-.008-.375-.01-.575-.01s-.525.075-.8.374c-.275.299-1.05 1.023-1.05 2.496 0 1.472 1.071 2.893 1.221 3.093.15.2 2.107 3.216 5.106 4.512.713.308 1.27.492 1.704.63.717.228 1.37.195 1.887.118.577-.087 1.772-.724 2.022-1.422.25-.699.25-1.297.175-1.422-.075-.125-.275-.199-.575-.349z"/></svg>
                      Chat on WhatsApp
                    </a>
                    
                    <div style={{ background: "#F9FAFB", padding: 16, borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 24 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Or Call Directly</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#0A0F1E", letterSpacing: -1 }}>{unlockedPhone}</div>
                    </div>
                    
                    <button onClick={() => { setShowContact(false); setUnlockedPhone(null); setStudentName(""); setStudentGrade(""); }} style={{ width: "100%", background: "#F3F4F6", color: "#374151", border: "none", padding: "16px", borderRadius: 16, fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "0.2s" }}>
                      Done
                    </button>
                  </div>
                )}
              </div>
           </div>
        )}
      </div>
    </>
  );
}