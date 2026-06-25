"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <style>{`
        .nav-desktop-links { display: flex; gap: 28px; align-items: center; margin-left: 32px; }
        @media (max-width: 800px) { .nav-desktop-links { display: none; } }
      `}</style>
      
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, background: "rgba(8,17,31,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 21, fontWeight: 900, color: "#fff", letterSpacing: -1, textDecoration: "none" }}>
            Tuto<span style={{ color: "#00C9A7" }}>.lk</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="nav-desktop-links">
            <Link href="/about" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
              About Us
            </Link>
            <Link href="/services" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
              How it Works
            </Link>
            <Link href="/contact" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
              Contact
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", padding: "7px 14px", borderRadius: 8, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>
            Teacher Login
          </Link>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 800, color: "#08111F", padding: "8px 18px", borderRadius: 8, textDecoration: "none", background: "#00C9A7", transition: "transform 0.15s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            Join as Tutor
          </Link>
        </div>
      </nav>
    </>
  );
}