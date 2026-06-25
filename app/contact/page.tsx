"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

const IcoArrow = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send data to your API endpoint
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

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
        .contact-form input, .contact-form textarea {
          width: 100%; padding: 14px 16px; border: 1px solid #E5E7EB; border-radius: 12px;
          font-size: 14px; font-family: 'Inter', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
          background: #F9FAFB;
        }
        .contact-form input:focus, .contact-form textarea:focus {
          outline: none; border-color: #00C9A7; box-shadow: 0 0 0 4px rgba(0,201,167,0.12);
          background: #fff;
        }
        .contact-form label { font-size: 13px; font-weight: 700; color: #374151; display: block; margin-bottom: 6px; }
        .contact-form .field-group { margin-bottom: 20px; }
        .submit-btn {
          background: #00C9A7; color: #08111F; font-weight: 800; padding: 14px 32px;
          border: none; border-radius: 12px; font-size: 15px; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 14px rgba(0,201,167,0.3);
        }
        .submit-btn:hover { background: #5EEAD4; transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-message { background: #D1FAE5; color: #065F46; padding: 16px 20px; border-radius: 12px; font-weight: 600; }
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
              Get in Touch
            </h1>
            <p className="hero-sub" style={{
              fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12,
              maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7
            }}>
              We'd love to hear from you – whether it's a question, a suggestion, or just to say hello.
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
              }}>C</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Contact Us</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>We reply within 24 hours</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Contact Info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
                <div style={{ background: "#F9FAFB", padding: "20px", borderRadius: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>Email</div>
                  <a href="mailto:hello@tuto.lk" style={{ color: "#00C9A7", fontWeight: 600, textDecoration: "none", fontSize: 15 }}>hello@tuto.lk</a>
                </div>
                <div style={{ background: "#F9FAFB", padding: "20px", borderRadius: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>Phone</div>
                  <a href="tel:+94111234567" style={{ color: "#00C9A7", fontWeight: 600, textDecoration: "none", fontSize: 15 }}>+94 11 123 4567</a>
                </div>
                <div style={{ background: "#F9FAFB", padding: "20px", borderRadius: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>Address</div>
                  <div style={{ fontSize: 14, color: "#374151" }}>Colombo, Sri Lanka</div>
                </div>
              </div>

              {/* Contact Form */}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="field-group">
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Kamal Perera" />
                </div>
                <div className="field-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                </div>
                <div className="field-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required placeholder="Tell us how we can help..." />
                </div>

                {submitted && (
                  <div className="success-message" style={{ marginBottom: 20 }}>
                    ✅ Thank you! We'll get back to you shortly.
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={submitted}>
                  {submitted ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            <div style={{
              marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB",
              fontSize: 14, color: "#6B7280", textAlign: "center"
            }}>
              You can also reach us on <a href="#" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}>Facebook</a> and <a href="#" style={{ color: "#00C9A7", fontWeight: 700, textDecoration: "none" }}>Instagram</a>.
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