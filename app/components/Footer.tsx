import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#0A0F1E", color: "#9CA3AF", padding: "60px 40px", marginTop: "80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
        
        {/* Brand Column */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 16 }}>Tuto.lk</h2>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            Sri Lanka&apos;s hyper-local tuition network. Connecting students with verified experts.
          </p>
        </div>

        {/* Links Column */}
        <div>
          <h4 style={{ color: "#fff", marginBottom: 16, fontSize: 14 }}>Legal</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <li><Link href="/privacy" style={{ color: "#9CA3AF", textDecoration: "none", fontSize: 13 }}>Privacy Policy</Link></li>
            <li><Link href="/terms" style={{ color: "#9CA3AF", textDecoration: "none", fontSize: 13 }}>Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h4 style={{ color: "#fff", marginBottom: 16, fontSize: 14 }}>Contact</h4>
          <p style={{ fontSize: 13 }}>support@tuto.lk</p>
        </div>
      </div>
      
      <div style={{ maxWidth: 1200, margin: "40px auto 0", paddingTop: 20, borderTop: "1px solid #1E293B", textAlign: "center", fontSize: 12 }}>
        &copy; {new Date().getFullYear()} Tuto.lk. All rights reserved.
      </div>
    </footer>
  );
}