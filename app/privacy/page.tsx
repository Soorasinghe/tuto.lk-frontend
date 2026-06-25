"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// ─── Particles (same as Terms) ──────────────────────────────────────
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
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────
const IcoArrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// ─── Page ──────────────────────────────────────────────────────────────
export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="hero-sub" style={{
              fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12,
              maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7
            }}>
              How we collect, use, and protect your data
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
              }}>P</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Privacy Policy</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Last updated: June 2026</div>
              </div>
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#1F2937" }}>
              <p style={{ marginBottom: 16 }}>
                At <strong>Tuto.lk</strong>, we take your privacy seriously. This policy explains what personal
                data we collect, why we collect it, and how we protect it.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}><strong>Account Data:</strong> When you register, we collect your name, email address, phone number, and profile information (e.g., subjects, locations).</li>
                <li style={{ marginBottom: 8 }}><strong>Usage Data:</strong> We collect information about how you interact with the platform, such as pages viewed, searches, and communication logs.</li>
                <li><strong>Device Data:</strong> IP address, browser type, and device identifiers may be collected for analytics and security.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}>To provide and improve our services, including matching students with suitable tutors.</li>
                <li style={{ marginBottom: 8 }}>To communicate with you about your account, updates, and promotional offers (you can opt out anytime).</li>
                <li>To ensure the safety and integrity of the platform, including fraud prevention.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>3. Sharing of Data</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}><strong>Tutors:</strong> Your profile information (name, subjects, locations) is visible to all users. Contact details are only shared after a booking is confirmed.</li>
                <li style={{ marginBottom: 8 }}><strong>Students:</strong> Your basic information (name, location) is shared with tutors you contact.</li>
                <li>We do not sell your personal data to third parties. We may share anonymised aggregate data for analytics.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>4. Data Security</h3>
              <p>
                We implement industry‑standard security measures, including encryption, secure servers, and access controls,
                to protect your data against unauthorised access, alteration, or destruction.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>5. Cookies</h3>
              <p>
                We use cookies to enhance user experience, remember preferences, and analyse site traffic. You can control
                cookie settings in your browser.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>6. Your Rights</h3>
              <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}><strong>Access:</strong> You can request a copy of the data we hold about you.</li>
                <li style={{ marginBottom: 8 }}><strong>Correction:</strong> You can update or correct your information at any time.</li>
                <li style={{ marginBottom: 8 }}><strong>Deletion:</strong> You may request deletion of your account and associated data.</li>
                <li>To exercise these rights, contact us at <a href="mailto:privacy@tuto.lk" style={{ color: "#00C9A7", textDecoration: "none" }}>privacy@tuto.lk</a>.</li>
              </ul>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>7. Third‑Party Services</h3>
              <p>
                We may use third‑party tools for analytics, payment processing, and advertising. These providers have their
                own privacy policies, and we encourage you to review them.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>8. Children's Privacy</h3>
              <p>
                Tuto.lk is not directed at children under 13. We do not knowingly collect personal information from minors.
                If we become aware of such data, we will delete it promptly.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>9. Changes to This Policy</h3>
              <p>
                We may update this policy from time to time. The latest version will always be published here. We will
                notify users of significant changes via email or a notice on the platform.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 32, marginBottom: 12 }}>10. Contact Us</h3>
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us at
                <a href="mailto:privacy@tuto.lk" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}> privacy@tuto.lk</a>.
              </p>

              <div style={{
                marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB",
                fontSize: 14, color: "#6B7280", textAlign: "center"
              }}>
                This Privacy Policy is part of our commitment to transparency and trust.
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
  <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
    <IcoArrow size={16} />
  </span>
  Back to Home
</Link>
        </div>

      </div>
    </>
  );
}