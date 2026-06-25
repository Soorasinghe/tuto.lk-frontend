"use client";

import Link from "next/link";
import { useEffect, useRef, type SVGProps } from "react";
import Navbar from "../components/Navbar"; // 🔥 Imported the reusable Navbar

// ─── Particles (same as above) ─────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const particles: any[] = [];
    const PARTICLE_COUNT = 50;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", resize);
    resize();
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(p.phase) * 0.2;
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        p.phase += 0.01;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => window.removeEventListener("resize", resize);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />;
}

const IcoArrow = ({ size = 14, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// ─── Icons for services ─────────────────────────────────────────────────────
const IcoSearch = () => (
  <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.43-4.9a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IcoBook = () => (
  <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IcoUsers = () => (
  <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IcoShield = () => (
  <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function ServicesPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #F6F7FA; color: #0A0F1E; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hero-h1 { animation: fadeUp 0.7s 0.1s ease both; }
        .hero-sub { animation: fadeUp 0.7s 0.2s ease both; }
        .content-card { animation: fadeUp 0.8s 0.3s ease both; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; margin-top: 24px; }
        .service-item { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; text-align: center; transition: all 0.2s; }
        .service-item:hover { border-color: #00C9A7; box-shadow: 0 8px 24px rgba(0,201,167,0.08); transform: translateY(-4px); }
        .service-item svg { color: #00C9A7; margin-bottom: 12px; }
        .service-item h4 { font-size: 16px; font-weight: 800; color: #0A0F1E; margin-bottom: 8px; }
        .service-item p { font-size: 14px; color: #6B7280; line-height: 1.6; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F6F7FA" }}>

        {/* ── NAV ── */}
        <Navbar />

        {/* ── HERO ── */}
        <div style={{
          background: "#08111F", position: "relative", overflow: "hidden",
          padding: "64px 40px 56px", textAlign: "center"
        }}>
          <Particles />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }} />
          <div style={{
            position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
            width: 500, height: 300, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, rgba(0,201,167,0.08) 0%, transparent 70%)"
          }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1 className="hero-h1" style={{
              fontSize: "clamp(36px, 4.5vw, 52px)", fontWeight: 900,
              color: "#fff", letterSpacing: -2, lineHeight: 1.1
            }}>
              Our Services
            </h1>
            <p className="hero-sub" style={{
              fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12,
              maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7
            }}>
              Everything you need to find the perfect tutor – completely free for students.
            </p>
          </div>
        </div>

        {/* ── CONTENT CARD ── */}
        <div className="content-card" style={{
          maxWidth: 900, margin: "-40px auto 60px", padding: "0 20px",
          position: "relative", zIndex: 10
        }}>
          <div style={{
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
            borderRadius: 28, padding: "48px 52px",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
            color: "#0A0F1E"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <span style={{
                background: "#00C9A7", color: "#fff",
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 900
              }}>S</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>What We Offer</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Designed for students and tutors alike</div>
              </div>
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#1F2937" }}>
              <p style={{ marginBottom: 24 }}>
                Tuto.lk provides a suite of tools to make tuition discovery seamless. Whether you're a student
                searching for help or a tutor looking to grow your practice, we've got you covered.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>For Students</h3>
              <div className="service-grid">
                <div className="service-item">
                  <IcoSearch />
                  <h4>Smart Search</h4>
                  <p>Find tutors by subject, level, and exact location – down to your village.</p>
                </div>
                <div className="service-item">
                  <IcoShield />
                  <h4>Verified Profiles</h4>
                  <p>Every tutor is vetted for qualifications, experience, and teaching ability.</p>
                </div>
                <div className="service-item">
                  <IcoUsers />
                  <h4>Community Reviews</h4>
                  <p>Read honest feedback from other students to make confident choices.</p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 48, marginBottom: 16 }}>For Tutors</h3>
              <div className="service-grid">
                <div className="service-item">
                  <IcoBook />
                  <h4>Professional Profile</h4>
                  <p>Showcase your subjects, qualifications, and teaching style to thousands of students.</p>
                </div>
                <div className="service-item">
                  <IcoUsers />
                  <h4>Premium Visibility</h4>
                  <p>Upgrade to Premium to appear at the top of search results and get more enquiries.</p>
                </div>
                <div className="service-item">
                  <IcoShield />
                  <h4>Trust & Credibility</h4>
                  <p>Build your reputation with verified reviews and a transparent track record.</p>
                </div>
              </div>

              <div style={{
                marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB",
                textAlign: "center", fontSize: 14, color: "#6B7280"
              }}>
                Ready to get started? <Link href="/" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}>Find a tutor now</Link> or <Link href="/contact" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}>contact us</Link> for more information.
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK LINK ── */}
        <div style={{ textAlign: "center", padding: "0 20px 40px" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "#6B7280", fontSize: 14, fontWeight: 600, textDecoration: "none",
            padding: "12px 24px", borderRadius: 12, border: "1px solid #E5E7EB",
            background: "#fff", transition: "all 0.2s"
          }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "#00C9A7"; }}
             onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E5E7EB"; }}>
            <IcoArrow size={16} style={{ transform: "rotate(180deg)" }} /> Back to Home
          </Link>
        </div>

      </div>
    </>
  );
}