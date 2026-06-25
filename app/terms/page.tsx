"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";

// ─── Icons ────────────────────────────────────────────────────────────────
const IcoArrow = ({ size = 14, style }: { size?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// ─── Particles (same as home) ──────────────────────────────────────────
// Implementation defined below.

// ─── Main Page ─────────────────────────────────────────────────────────
export default function TermsPage() {
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

        {/* ── NAV (identical to home) ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", height: 60,
          background: "rgba(8,17,31,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          <Link href="/" style={{ fontSize: 21, fontWeight: 900, color: "#fff", letterSpacing: -1, textDecoration: "none" }}>
            Tuto<span style={{ color: "#00C9A7" }}>.lk</span>
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", padding: "7px 14px", borderRadius: 8, textDecoration: "none" }}>
              Teacher Login
            </Link>
            <Link href="/login" style={{
              fontSize: 13, fontWeight: 800, color: "#08111F",
              padding: "8px 18px", borderRadius: 8, textDecoration: "none",
              background: "#00C9A7", transition: "transform 0.15s"
            }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              Join as Tutor
            </Link>
          </div>
        </nav>

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
              Terms of Service
            </h1>
            <p className="hero-sub" style={{
              fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12,
              maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7
            }}>
              Last updated: June 2026
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
              }}>T</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Tuto.lk – Terms of Service</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Effective from 1 June 2026</div>
              </div>
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#1F2937" }}>
              <p style={{ marginBottom: 16 }}>
                Welcome to <strong>Tuto.lk</strong> (the "Platform"). By using our platform, you agree to the following terms.
                Please read them carefully.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>1. Acceptance of Terms</h3>
              <p>
                By accessing or using Tuto.lk, you agree to be bound by these Terms of Service and our Privacy Policy.
                If you do not agree, please do not use the platform.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>2. Description of Service</h3>
              <p>
                Tuto.lk is an online marketplace that connects students ("Students") with independent tutors ("Tutors")
                offering academic tutoring services. We facilitate discovery and communication but do not directly
                provide tutoring services or guarantee the quality of any tutor.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>3. User Accounts</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}><strong>Students:</strong> You may browse tutor profiles without an account, but booking sessions or contacting tutors requires registration.</li>
                <li style={{ marginBottom: 8 }}><strong>Tutors:</strong> You must create a tutor account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide truthful information and update it as needed.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>4. Tutor Responsibilities</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}>Tutors are independent contractors and not employees of Tuto.lk.</li>
                <li style={{ marginBottom: 8 }}>Tutors must hold relevant qualifications and provide accurate descriptions of their services.</li>
                <li>You agree to deliver tutoring sessions in a professional, punctual manner.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>5. Payments and Fees</h3>
              <p>
                Tuto.lk may charge a service fee for certain transactions. Currently, the platform is free for students.
                Tutors may be subject to a subscription fee for Premium features. All fees will be clearly displayed before
                you commit to any payment.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>6. Content and Intellectual Property</h3>
              <p>
                You retain ownership of any content you upload (profile, messages, etc.). By posting, you grant Tuto.lk a
                non‑exclusive, worldwide, royalty‑free license to use, display, and distribute your content for the purpose
                of operating and improving the platform.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>7. Prohibited Conduct</h3>
              <p style={{ marginBottom: 8 }}>You agree not to:</p>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 6 }}>Post false, misleading, or inappropriate content.</li>
                <li style={{ marginBottom: 6 }}>Harass, abuse, or threaten any other user.</li>
                <li style={{ marginBottom: 6 }}>Use the platform for any illegal or unauthorised purpose.</li>
                <li>Attempt to bypass security measures or disrupt the service.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>8. Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these terms or
                for any other reason, with or without notice.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>9. Disclaimers and Limitation of Liability</h3>
              <p style={{ marginBottom: 8 }}>
                Tuto.lk is provided "as is" without warranties of any kind. We do not guarantee the accuracy, reliability,
                or fitness of any tutor or content. To the fullest extent permitted by law, we are not liable for any
                damages arising from your use of the platform.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>10. Governing Law</h3>
              <p>
                These terms are governed by the laws of Sri Lanka. Any disputes shall be resolved exclusively in the
                courts of Colombo.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>11. Changes to Terms</h3>
              <p>
                We may update these terms from time to time. The latest version will always be posted here. Your continued
                use of the platform constitutes acceptance of any changes.
              </p>

              <div style={{
                marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB",
                fontSize: 14, color: "#6B7280", textAlign: "center"
              }}>
                For any questions, contact us at <a href="mailto:legal@tuto.lk" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}>legal@tuto.lk</a>.
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER (optional simple back link) ── */}
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

// ─── Particles implementation (copy from home) ────────────────────────
function Particles() {
  // (full implementation – same as home)
  // For brevity in this response I'm including a placeholder; ensure you copy the exact code from home.
  // Below is the full version:
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
        phase: Math.random() * Math.PI * 2
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