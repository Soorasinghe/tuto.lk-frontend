"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import Navbar from "../components/Navbar"; // 🔥 Imported the reusable Navbar

// ─── Particles (same as home) ──────────────────────────────────────────────
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

const IcoArrow = ({ size = 14, style }: { size?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function AboutPage() {
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
              About Tuto.lk
            </h1>
            <p className="hero-sub" style={{
              fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12,
              maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7
            }}>
              Empowering Sri Lankan students to find their perfect tutor – right in their own village.
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
              }}>A</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Our Story</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Built for Sri Lanka, by Sri Lankans</div>
              </div>
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#1F2937" }}>
              <p style={{ marginBottom: 16 }}>
                <strong>Tuto.lk</strong> was born out of a simple idea: every student in Sri Lanka deserves
                access to high‑quality tuition, no matter where they live. Whether you're in Colombo,
                Kandy, Jaffna, or a remote village, finding the right tutor should be easy, transparent,
                and free for students.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>Our Mission</h3>
              <p>
                To bridge the gap between students and verified educators by creating a hyper‑local,
                technology‑driven platform that respects the diversity of Sri Lanka's education system.
                We believe that geography should never be a barrier to learning.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>What Makes Us Different</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}><strong>Hyper‑local search:</strong> Search by province, district, city, or even village – find tutors in your neighbourhood.</li>
                <li style={{ marginBottom: 8 }}><strong>Verified educators:</strong> Every tutor is manually verified for qualifications and teaching experience.</li>
                <li style={{ marginBottom: 8 }}><strong>Free for students:</strong> No hidden fees. Students can browse and connect with tutors at no cost.</li>
                <li><strong>Transparent ratings:</strong> Real reviews from real students help you make informed choices.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>Our Team</h3>
              <p>
                We are a small, passionate team of educators, developers, and designers who believe in
                the power of education. Based in Sri Lanka, we work tirelessly to improve the platform
                and serve our community.
              </p>

              <div style={{
                marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB",
                fontSize: 14, color: "#6B7280", textAlign: "center"
              }}>
                Have questions? We'd love to hear from you – <Link href="/contact" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}>get in touch</Link>.
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