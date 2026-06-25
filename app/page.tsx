"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Location {
  province: string;
  district: string;
  city: string;
  village?: string;
}

interface Teacher {
  id: string;
  name: string;
  subjects?: string[];
  academicLevels?: string[];
  locations?: Location[];
  profile_pic_url?: string;
  subscription_tier?: "Premium" | "Normal" | "Basic";
  is_verified?: boolean;
  profile_views?: number;
}

interface Ad {
  placement: string;
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface City {
  name: string;
  villages?: string[];
}

interface District {
  name: string;
  cities?: City[];
}

interface Province {
  province: string;
  districts?: District[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ["Combined Maths", "Physics", "Chemistry", "Biology", "ICT", "English"];
const ACADEMIC_LEVELS = ["Grade 6–9", "O/L", "A/L", "Edexcel & Cambridge"];
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

const GEO_URL = "https://code.highcharts.com/mapdata/countries/lk/lk-all.geo.json";

// Map translation dictionary to convert raw map data into standard English District names
const DISTRICT_NAME_MAP: Record<string, string> = {
  "Kolamba": "Colombo",
  "Gălla": "Galle",
  "Mahanuvara": "Kandy",
  "Yāpanaya": "Jaffna",
  "Tirikuṇāmalaya": "Trincomalee",
  "Kuruṇægala": "Kurunegala",
  "Anurādhapura": "Anuradhapura",
  "Mātale": "Matale",
  "Polonnaruva": "Polonnaruwa",
  "Maḍakalapuva": "Batticaloa",
  "Ampāra": "Ampara",
  "Hambantoṭa": "Hambantota",
  "Mātara": "Matara",
  "Kægalla": "Kegalle",
  "Ratnapura": "Ratnapura",
  "Badulla": "Badulla",
  "Moṇarāgala": "Moneragala",
  "Puttalama": "Puttalam",
  "Kalutara": "Kalutara",
  "Gampaha": "Gampaha",
  "Mannārama": "Mannar",
  "Vavuniyāva": "Vavuniya",
  "Mulativ": "Mullaitivu",
  "Kilinoccī": "Kilinochchi",
  "Nuvara Ĕliya": "Nuwara Eliya"
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Physics":        { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Chemistry":      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Biology":        { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  "Combined Maths": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "ICT":            { bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4" },
  "English":        { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
};
const DEFAULT_SUBJECT_COLOR = { bg: "#F8FAFC", text: "#475569", border: "#CBD5E1" };

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcoSearch = () => <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IcoCheck = ({ size = 13 }: { size?: number }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IcoPin = ({ size = 13 }: { size?: number }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IcoArrow = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const IcoStar = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const IcoFlame = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>;
const IcoImage = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IcoFilter = () => <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

// ─── Sri Lanka interactive map (District mode) ─────────────────────────────

function projectToSvg(rings: number[][][][], bounds: any, width: number, height: number, padding: number): string {
  const { minLon, maxLon, minLat, maxLat } = bounds;
  const lonRange = maxLon - minLon || 1;
  const latRange = maxLat - minLat || 1;
  const scale = Math.min((width - padding * 2) / lonRange, (height - padding * 2) / latRange);
  const offsetX = padding + (width - padding * 2 - lonRange * scale) / 2;
  const offsetY = padding + (height - padding * 2 - latRange * scale) / 2;

  const project = (lon: number, lat: number) => [
    offsetX + (lon - minLon) * scale,
    offsetY + (maxLat - lat) * scale
  ];

  return rings.map((polygon) => polygon.map((ring) => {
    const pts = ring.map(([lon, lat]) => project(lon, lat));
    return "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z";
  }).join(" ")).join(" ");
}

function SriLankaMap({ teacherCountsByDistrict, onSelectDistrict }: { teacherCountsByDistrict: Record<string, number>; onSelectDistrict: (d: string) => void; }) {
  const [shapes, setShapes] = useState<any[] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEO_URL).then(res => res.json()).then(geo => {
      let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
      const allRings: any[] = [];
      for (const f of geo.features) {
        const name = f.properties?.name ?? f.properties?.["hc-key"] ?? "Unknown";
        let polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        for (const polygon of polygons) for (const ring of polygon) for (const [lon, lat] of ring) {
          if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
        }
        allRings.push({ name, rings: polygons });
      }
      setShapes(allRings.map(({ name, rings }) => ({
        name, path: projectToSvg(rings, { minLon, maxLon, minLat, maxLat }, 300, 480, 10)
      })));
    }).catch(() => {});
  }, []);

  const mappedDistrictName = hovered ? (DISTRICT_NAME_MAP[hovered] ?? hovered) : null;
  const activeCount = mappedDistrictName ? (teacherCountsByDistrict[mappedDistrictName] ?? 0) : null;

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Tap a district</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#5EEAD4" }}>{hovered ? "Click to search" : "Hover to explore"}</span>
      </div>
      {shapes ? (
        <svg viewBox="0 0 300 480" style={{ width: "100%", height: "auto", display: "block", margin: "0 auto" }}>
          {shapes.map((shape) => {
            const isHovered = hovered === shape.name;
            return (
              <path key={shape.name} d={shape.path} fill={isHovered ? "#00C9A7" : "#1E3A5F"} fillOpacity={isHovered ? 1 : 0.85} stroke="#08111F" strokeWidth={1}
                style={{ cursor: "pointer", transition: "fill 0.15s" }}
                onMouseEnter={() => setHovered(shape.name)} onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectDistrict(DISTRICT_NAME_MAP[shape.name] ?? shape.name)}
              />
            );
          })}
        </svg>
      ) : <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading map…</div>}
      
      <div style={{ marginTop: 12, background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{mappedDistrictName ? `${mappedDistrictName} District` : "Select a district"}</span>
        {mappedDistrictName && <span style={{ fontSize: 12, fontWeight: 700, color: "#5EEAD4" }}>{activeCount} tutor{activeCount === 1 ? "" : "s"}</span>}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, url, size, bg, border, color }: { name: string; url?: string; size: number; bg: string; border: string; color: string; }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: bg, border: `1px solid ${border}`, color, fontWeight: 900, fontSize: size * 0.35 }}>
      {url ? <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

function SubjectPill({ label }: { label: string }) {
  const c = SUBJECT_COLORS[label] ?? DEFAULT_SUBJECT_COLOR;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "4px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── MODERN DIRECTORY CARDS ───────────────────────────────────────────────────

function PremiumCard({ teacher }: { teacher: Teacher }) {
  const [hovered, setHovered] = useState(false);
  const subs = teacher.subjects ?? [];
  const locs = teacher.locations?.map((l) => l.city).filter(Boolean).join(", ") || "Island-wide";

  return (
    <Link href={`/teachers/${teacher.id}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 320, maxWidth: 320, flexShrink: 0, scrollSnapAlign: "start", textDecoration: "none", display: "flex", flexDirection: "column",
        background: "#ffffff",
        border: `1px solid ${hovered ? "#38BDF8" : "#E2E8F0"}`, 
        borderRadius: 20, padding: 24, position: "relative",
        boxShadow: hovered ? "0 20px 40px rgba(15, 23, 42, 0.08)" : "0 4px 12px rgba(15, 23, 42, 0.03)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)", transition: "all 0.2s ease-out",
      }}>
      
      {/* Header: Avatar and Premium Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar name={teacher.name} url={teacher.profile_pic_url} size={54} bg="#F0F9FF" border="#BAE6FD" color="#0284C7" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", letterSpacing: -0.3, lineHeight: 1.2 }}>{teacher.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#10B981", marginTop: 4 }}>
              <IcoCheck size={12} /> Verified Educator
            </div>
          </div>
        </div>
        
        {/* Subtle Premium Badge */}
        <div style={{ background: "linear-gradient(135deg, #F0F9FF, #E0F2FE)", color: "#0369A1", border: "1px solid #BAE6FD", fontSize: 10, fontWeight: 900, padding: "5px 10px", borderRadius: 12, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
           <IcoStar size={12} /> Premium
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {subs.slice(0, 3).map((s) => <SubjectPill key={s} label={s} />)}
        {subs.length > 3 && <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", padding: "4px 6px" }}>+{subs.length - 3}</span>}
        {subs.length === 0 && <SubjectPill label="Various Subjects" />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 20 }}>
        <span style={{ color: "#0284C7" }}><IcoPin size={13} /></span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{locs}</span>
      </div>

      <div style={{ marginTop: "auto", background: hovered ? "#F8FAFC" : "#ffffff", borderTop: "1px solid #F1F5F9", paddingTop: 16, fontSize: 13, fontWeight: 800, color: hovered ? "#0284C7" : "#475569", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
        View Full Profile <IcoArrow size={14} />
      </div>
    </Link>
  );
}

function StandardCard({ teacher }: { teacher: Teacher }) {
  const [hovered, setHovered] = useState(false);
  const subs = teacher.subjects ?? [];
  const locs = teacher.locations?.map((l) => l.city).filter(Boolean).join(", ") || "Island-wide";

  return (
    <Link href={`/teachers/${teacher.id}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#ffffff", border: `1px solid ${hovered ? "#CBD5E1" : "#E2E8F0"}`, borderRadius: 16, padding: 20, boxShadow: hovered ? "0 12px 24px rgba(15, 23, 42, 0.04)" : "0 2px 8px rgba(15, 23, 42, 0.02)", transform: hovered ? "translateY(-2px)" : "translateY(0)", transition: "all 0.2s ease-out", overflow: "hidden" }}>
      
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
        <Avatar name={teacher.name} url={teacher.profile_pic_url} size={48} bg="#F8FAFC" border="#E2E8F0" color="#475569" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", letterSpacing: -0.3, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {teacher.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#10B981", marginTop: 4 }}>
            {teacher.is_verified && <><IcoCheck size={11} /> Verified</>}
            {/* 🔥 Added subtle Premium badge to the standard grid cards */}
            {teacher.subscription_tier === "Premium" && (
              <span style={{ color: "#0284C7", display: "flex", alignItems: "center", gap: 3, marginLeft: 6, borderLeft: "1px solid #E2E8F0", paddingLeft: 8 }}>
                <IcoStar size={11} /> Premium
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {subs.slice(0, 2).map((s) => <SubjectPill key={s} label={s} />)}
        {subs.length > 2 && <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: "4px 4px" }}>+{subs.length - 2}</span>}
        {subs.length === 0 && <SubjectPill label="Various" />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 20 }}>
        <span style={{ color: "#94A3B8" }}><IcoPin size={13} /></span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{locs}</span>
      </div>

      <div style={{ borderTop: "1px solid #F1F5F9", marginTop: "auto", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 800, color: hovered ? "#0F172A" : "#94A3B8", transition: "color 0.2s" }}>
        View Profile <IcoArrow size={13} />
      </div>
    </Link>
  );
}

function Skeleton({ h = 200 }: { h?: number }) {
  return <div style={{ background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.4s infinite", borderRadius: 16, height: h, border: "1px solid #E2E8F0" }} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [trending, setTrending] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeAds, setActiveAds] = useState<Ad[]>([]);

  // Hero Search state
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [locationTree, setLocationTree] = useState<Province[]>([]);
  const [selProv, setSelProv] = useState("");
  const [selDist, setSelDist] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selVill, setSelVill] = useState("");

  // Secondary Filter/Sort State
  const [nameSearch, setNameSearch] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const activeDistricts = locationTree.find((p) => p.province === selProv)?.districts ?? [];
  const activeCities = activeDistricts.find((d) => d.name === selDist)?.cities ?? [];
  const activeVillages = activeCities.find((c) => c.name === selCity)?.villages ?? [];

  // Map count now calculates by District
  const teacherCountsByDistrict = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of teachers) {
      const districts = new Set((t.locations ?? []).map((l) => l.district).filter(Boolean));
      for (const d of districts) counts[d] = (counts[d] ?? 0) + 1;
    }
    return counts;
  }, [teachers]);

  // ─── Auto-scroll for Premium Carousel ──────────────────────────────────────
  const premiumScrollRef = useRef<HTMLDivElement>(null);
  const [autoScrollActive, setAutoScrollActive] = useState(true);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [locRes, teacherRes, adRes, trendRes] = await Promise.all([
          fetch(`${API_BASE}/api/teachers/locations`),
          fetch(`${API_BASE}/api/search`),
          fetch(`${API_BASE}/api/ads/active`),
          fetch(`${API_BASE}/api/search/trending`)
        ]);
        const [locJson, teacherJson, adJson, trendJson] = await Promise.all([
          locRes.json(), teacherRes.json(), adRes.json(), trendRes.json()
        ]);
        if (locJson.success) setLocationTree(locJson.data);
        if (teacherJson.success) setTeachers(teacherJson.data);
        
        if (adJson.success && adJson.data) setActiveAds(Array.isArray(adJson.data) ? adJson.data : [adJson.data]);
        
        if (trendJson.success && trendJson.data) setTrending(trendJson.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const runSearch = async (overrides?: { province?: string, district?: string }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject) params.append("subject", subject);
      if (level) params.append("level", level);

      const districtToUse = overrides?.district ?? selDist;
      const provinceToUse = overrides?.province ?? selProv;

      if (!overrides?.district && selVill) params.append("village", selVill);
      else if (!overrides?.district && selCity) params.append("city", selCity);
      else if (districtToUse) params.append("district", districtToUse);
      else if (provinceToUse) params.append("province", provinceToUse);

      const res = await fetch(`${API_BASE}/api/search?${params}`);
      const json = await res.json();
      if (json.success) setTeachers(json.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch();
  };

  // Map Click Handler
  const handleDistrictSelect = async (districtName: string) => {
    let foundProv = "";
    for (const p of locationTree) {
      if (p.districts?.some(d => d.name === districtName)) {
        foundProv = p.province;
        break;
      }
    }
    
    setSelProv(foundProv); 
    setSelDist(districtName); 
    setSelCity(""); 
    setSelVill("");
    
    await runSearch({ province: foundProv, district: districtName });
    const resultsEl = document.getElementById("results-section");
    if (resultsEl) resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── Process teachers (filter + sort) ─────────────────────────────────────
  const processedTeachers = useMemo(() => {
    let result = [...teachers];

    if (nameSearch.trim()) {
      const query = nameSearch.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(query));
    }

    if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      const tierWeights: Record<string, number> = { 'Premium': 3, 'Normal': 2, 'Basic': 1 };
      result.sort((a, b) => {
        const weightA = tierWeights[a.subscription_tier || 'Basic'];
        const weightB = tierWeights[b.subscription_tier || 'Basic'];
        return weightB - weightA; 
      });
    }

    return result;
  }, [teachers, nameSearch, sortBy]);

  // 🔥 Split into Premium Carousel and All Grid
  
  // 1. The Carousel gets ONLY Premium teachers, sorted by highest profile views
  const premiumCarouselTeachers = processedTeachers
    .filter((t) => t.subscription_tier === "Premium")
    .sort((a, b) => (b.profile_views || 0) - (a.profile_views || 0));

  // 2. The Grid gets EVERYONE. Since `processedTeachers` is already sorted by tier
  // (Premium -> Normal -> Basic) via the default dropdown, Premium teachers naturally populate the top!
  const allGridTeachers = processedTeachers;

  // ─── Auto‑scroll effect ──────────────────────────────────────────────────
  useEffect(() => {
    const container = premiumScrollRef.current;
    if (!container || premiumCarouselTeachers.length === 0) return;

    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!autoScrollActive) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 1) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 338, behavior: "smooth" });
        }
      }, 3500);
    };

    startAutoScroll();

    const pauseAutoScroll = () => setAutoScrollActive(false);
    const resumeAutoScroll = () => setAutoScrollActive(true);

    container.addEventListener("mouseenter", pauseAutoScroll);
    container.addEventListener("mouseleave", resumeAutoScroll);
    container.addEventListener("touchstart", pauseAutoScroll);
    container.addEventListener("touchend", resumeAutoScroll);

    return () => {
      clearInterval(scrollInterval);
      container.removeEventListener("mouseenter", pauseAutoScroll);
      container.removeEventListener("mouseleave", resumeAutoScroll);
      container.removeEventListener("touchstart", pauseAutoScroll);
      container.removeEventListener("touchend", resumeAutoScroll);
    };
  }, [premiumCarouselTeachers.length, autoScrollActive]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; color: #0F172A; }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes skshimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .hero-eyebrow { animation: fadeUp 0.6s ease both; }
        .hero-h1      { animation: fadeUp 0.7s 0.1s ease both; }
        .hero-sub     { animation: fadeUp 0.7s 0.2s ease both; }
        .hero-stats   { animation: fadeUp 0.7s 0.3s ease both; }
        .hero-map     { animation: fadeUp 0.8s 0.15s ease both; }
        .search-float { animation: fadeUp 0.8s 0.25s ease both; }

        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 32px; align-items: center; max-width: 1160px; margin: 0 auto; padding: 64px 40px 56px; }
        @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; padding: 48px 20px; text-align: center; } }

        .premium-scroll { display: flex; gap: 18px; overflow-x: auto; padding-bottom: 20px; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .premium-scroll::-webkit-scrollbar { display: none; }
        .std-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; }

        .sf { flex: 1; min-width: 0; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 10px 14px; backdrop-filter: blur(8px); transition: border-color 0.2s, background 0.2s; }
        .sf:focus-within { border-color: #00C9A7; background: rgba(0,201,167,0.08); }
        .sf label { display: block; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
        .sf select { width: 100%; background: transparent; border: none; outline: none; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; appearance: none; font-family: 'Inter', sans-serif; }
        .sf select option { background: #1E2D45; color: #fff; }
        .sf select:disabled { color: rgba(255,255,255,0.25); cursor: default; }

        .search-row { display: flex; gap: 10px; }
        @media (max-width: 640px) { .search-row { flex-direction: column; } }
        
        .main-layout { display: flex; gap: 40px; align-items: flex-start; }
        .content-col { flex: 1 1 68%; min-width: 0; }
        .sidebar-col { flex: 1 1 32%; min-width: 320px; position: sticky; top: 100px; display: flex; flex-direction: column; gap: 24px; }
        
        @media (max-width: 980px) {
          .main-layout { flex-direction: column; }
          .sidebar-col { width: 100%; position: static; }
        }
        
        .toolbar-focus:focus-within { border-color: #38BDF8 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(56,189,248,0.15) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>

        {/* ── NAV ── */}
        <Navbar />

        {/* ── HERO ── */}
        <div style={{ background: "#08111F", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div style={{ position: "absolute", top: -100, left: "20%", width: 500, height: 300, pointerEvents: "none", background: "radial-gradient(ellipse at center, rgba(0,201,167,0.08) 0%, transparent 70%)" }} />

          <div className="hero-grid" style={{ position: "relative", zIndex: 1 }}>
            <div>
              <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)", color: "#5EEAD4", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C9A7", animation: "blink 2s infinite", display: "inline-block" }} />
                Sri Lanka&apos;s hyper-local tuition network
              </div>
              <h1 className="hero-h1" style={{ fontSize: "clamp(34px, 4.2vw, 52px)", fontWeight: 900, lineHeight: 1.08, color: "#fff", letterSpacing: -2, marginBottom: 18 }}>
                Find your tutor - <span style={{ background: "linear-gradient(100deg, #00C9A7, #5EEAD4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>right down to your village.</span>
              </h1>
              <p className="hero-sub" style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 440, marginBottom: 32 }}>
                Verified O/L, A/L and Cambridge tutors across all 25 districts. Search by subject, level, and exact location.
              </p>
              
              <div className="hero-stats" style={{ display: "flex", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "18px 12px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{teachers.length > 0 ? `${teachers.length}+` : "1,200+"}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Registered teachers</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "18px 12px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{SUBJECTS.length * 4}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Subjects covered</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "18px 12px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>25</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Districts covered</div>
                </div>
              </div>
            </div>

            <div className="hero-map">
              <SriLankaMap teacherCountsByDistrict={teacherCountsByDistrict} onSelectDistrict={handleDistrictSelect} />
            </div>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="search-float" style={{ maxWidth: 860, margin: "-36px auto 0", padding: "0 20px", position: "relative", zIndex: 20 }}>
          <form onSubmit={handleSearch} style={{ background: "linear-gradient(145deg, rgba(13,27,53,0.97), rgba(8,17,31,0.99))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "22px 22px 18px", boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,201,167,0.08), inset 0 1px 0 rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Refine your search</div>
            
            <div className="search-row" style={{ marginBottom: 10 }}>
              <div className="sf">
                <label>Academic Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Any Level</option>{ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
              </div>
              <div className="sf">
                <label>Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Any Subject</option>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            </div>

            <div className="search-row" style={{ marginBottom: 16 }}>
              <div className="sf">
                <label>Province</label>
                <select value={selProv} onChange={(e) => { setSelProv(e.target.value); setSelDist(""); setSelCity(""); setSelVill(""); }}><option value="">Any Province</option>{locationTree.map((p) => <option key={p.province} value={p.province}>{p.province}</option>)}</select>
              </div>
              <div className="sf">
                <label>District</label>
                <select value={selDist} disabled={!selProv} onChange={(e) => { setSelDist(e.target.value); setSelCity(""); setSelVill(""); }}><option value="">Any District</option>{activeDistricts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}</select>
              </div>
              <div className="sf">
                <label>City / Town</label>
                <select value={selCity} disabled={!selDist} onChange={(e) => { setSelCity(e.target.value); setSelVill(""); }}><option value="">Any City</option>{activeCities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
              </div>
              <div className="sf">
                <label>Village</label>
                <select value={selVill} disabled={!selCity} onChange={(e) => setSelVill(e.target.value)}><option value="">Any Village</option>{activeVillages.map((v) => <option key={v} value={v}>{v}</option>)}</select>
              </div>
            </div>

            <button type="submit" style={{ width: "100%", border: "none", borderRadius: 14, padding: "15px 0", cursor: "pointer", fontSize: 15, fontWeight: 800, letterSpacing: -0.2, background: "linear-gradient(100deg, #00C9A7, #5EEAD4)", color: "#08111F", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(0,201,167,0.35)", transition: "opacity 0.2s, transform 0.15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
              <IcoSearch /> Search Tutors
            </button>
          </form>
        </div>

        {/* ── WRAPPER FOR FULL WIDTH SECTIONS + MAIN LAYOUT ── */}
        <div id="results-section" style={{ maxWidth: 1200, margin: "52px auto 0", padding: "0 20px 100px" }}>
          
          {/* 1. FULL WIDTH TOP AD SLOT */}
          {activeAds.filter(ad => ad.placement === "Top" || !ad.placement).length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                Sponsored <span style={{ width: 4, height: 4, background: "#CBD5E1", borderRadius: "50%" }}></span>
              </div>
              {(() => {
                const topAd = activeAds.filter(ad => ad.placement === "Top" || !ad.placement)[0];
                return (
                  <a href={topAd.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", borderRadius: 20, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 12px 32px rgba(15, 23, 42, 0.04)" }}>
                    <img src={topAd.imageUrl} alt={topAd.title} style={{ width: "100%", maxHeight: 250, objectFit: "cover", display: "block" }} />
                  </a>
                );
              })()}
            </div>
          )}

          {/* 2. SECONDARY FILTER & SORT TOOLBAR */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 40, background: "#ffffff", padding: "16px 24px", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.02)" }}>
            
            <div className="toolbar-focus" style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 300px", background: "#F8FAFC", padding: "12px 16px", borderRadius: 14, border: "1px solid #E2E8F0", transition: "all 0.2s" }}>
              <span style={{ color: "#94A3B8" }}><IcoSearch /></span>
              <input 
                type="text" 
                value={nameSearch} 
                onChange={(e) => setNameSearch(e.target.value)} 
                placeholder="Find a specific tutor by name..." 
                style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: "#0F172A", fontFamily: "'Inter', sans-serif" }} 
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                <IcoFilter /> Sort By
              </span>
              <div className="toolbar-focus" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "2px 4px", transition: "all 0.2s" }}>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 700, color: "#0F172A", cursor: "pointer", padding: "8px 12px", fontFamily: "'Inter', sans-serif" }}
                >
                  <option value="recommended">⭐ Recommended (Premium First)</option>
                  <option value="name_asc">A to Z</option>
                  <option value="name_desc">Z to A</option>
                </select>
              </div>
            </div>

          </div>

          {/* 3. PREMIUM TUTORS WITH AUTO-SCROLL */}
          {!loading && premiumCarouselTeachers.length > 0 && (
            <div style={{ marginBottom: 52 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #F0F9FF, #E0F2FE)", border: "1px solid #BAE6FD", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 900, color: "#0284C7", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                   Featured
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: -0.6 }}>Premium Educators</div>
              </div>
              <div className="premium-scroll" ref={premiumScrollRef}>
                {premiumCarouselTeachers.map((t) => <PremiumCard key={t.id} teacher={t} />)}
              </div>
            </div>
          )}

          {/* 4. 70/30 SPLIT FOR ALL TUTORS & SIDEBAR */}
          <div className="main-layout">
            
            <main className="content-col">
              {loading && (
                <div className="std-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} />)}
                </div>
              )}

              {!loading && allGridTeachers.length === 0 && (
                <div style={{ textAlign: "center", padding: "72px 24px", background: "#ffffff", borderRadius: 24, border: "1px dashed #CBD5E1" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>No tutors found</h3>
                  <p style={{ fontSize: 14, color: "#64748B", maxWidth: 340, margin: "0 auto" }}>
                    {nameSearch ? `No tutors match the name "${nameSearch}".` : "Try broadening your filters — choose a district or province for more results."}
                  </p>
                </div>
              )}

              {!loading && allGridTeachers.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: "2px dashed #E2E8F0" }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: -0.6 }}>All Tutors</div>
                      <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500, marginTop: 4 }}>Verified educators matching your search</div>
                    </div>
                    <div style={{ background: "#F1F5F9", color: "#475569", padding: "6px 12px", borderRadius: 10, fontSize: 13, fontWeight: 800, border: "1px solid #E2E8F0" }}>
                      {allGridTeachers.length} Result{allGridTeachers.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="std-grid">
                    {allGridTeachers.map((t) => <StandardCard key={t.id} teacher={t} />)}
                  </div>
                </div>
              )}
            </main>

            <aside className="sidebar-col">
              {/* Trending Tutors Widget */}
              <div style={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 24, boxShadow: "0 12px 32px rgba(15, 23, 42, 0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", display: "flex", alignItems: "center", gap: 6, letterSpacing: -0.4 }}>
                    <span style={{ color: "#EF4444" }}><IcoFlame /></span> Trending Tutors
                  </h3>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", background: "#F1F5F9", padding: "4px 8px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Top 5
                  </span>
                </div>

                {!loading && trending.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, textAlign: "center", padding: "24px 0" }}>No trending data yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {trending.map((teacher, index) => {
                      let rankBg = "#F8FAFC";
                      let rankColor = "#64748B";
                      let rankBorder = "#E2E8F0";
                      
                      // Highlight the Top 3 lightly
                      if (index === 0) { rankBg = "#FEF2F2"; rankColor = "#EF4444"; rankBorder = "#FECACA"; } 
                      else if (index === 1) { rankBg = "#FFF7ED"; rankColor = "#F97316"; rankBorder = "#FFEDD5"; } 
                      else if (index === 2) { rankBg = "#F0FDF4"; rankColor = "#10B981"; rankBorder = "#DCFCE7"; } 

                      return (
                        <Link href={`/teachers/${teacher.id}`} key={teacher.id} style={{
                          display: "flex", alignItems: "center", gap: 14, textDecoration: "none", padding: "10px", borderRadius: 16, border: "1px solid transparent", transition: "all 0.2s",
                        }} onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#E2E8F0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
                          <div style={{ width: 28, height: 28, borderRadius: "8px", background: rankBg, color: rankColor, border: `1px solid ${rankBorder}`, fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            #{index + 1}
                          </div>
                          <Avatar name={teacher.name} url={teacher.profile_pic_url} size={42} bg="#F1F5F9" border="#fff" color="#475569" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: -0.2 }}>
                              {teacher.name}
                            </h4>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
                              {teacher.profile_views || 0} Views
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Stacked Ads Widget */}
              {activeAds.filter(ad => ad.placement === "Sidebar").length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {activeAds.filter(ad => ad.placement === "Sidebar").map((ad, idx) => (
                    <div key={idx} style={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 16, boxShadow: "0 12px 32px rgba(15, 23, 42, 0.03)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CBD5E1" }}></span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sponsored</span>
                      </div>
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", borderRadius: 14, overflow: "hidden", border: "1px solid #F1F5F9", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        <img src={ad.imageUrl} alt={ad.title} style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Premium CTA Widget */}
              <div style={{
                background: "linear-gradient(135deg, #ffffff, #F0F9FF)",
                border: "1px solid #BAE6FD", borderRadius: 24, padding: 28,
                textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
                boxShadow: "0 12px 32px rgba(2, 132, 199, 0.08)"
              }}>
                <div style={{ background: "#ffffff", padding: 14, borderRadius: "50%", boxShadow: "0 8px 24px rgba(2, 132, 199, 0.15)", marginBottom: 16, color: "#0284C7" }}>
                  <IcoImage size={24} />
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", marginBottom: 6, letterSpacing: -0.4 }}>Advertise with us</h4>
                <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500, marginBottom: 20, lineHeight: 1.6 }}>
                  Put your brand in front of thousands of Sri Lankan students actively searching for tuition.
                </p>
                <a href="mailto:ads@tuto.lk" style={{
                  background: "#0F172A", color: "#fff", padding: "14px 20px", borderRadius: 14,
                  fontSize: 14, fontWeight: 800, textDecoration: "none", display: "inline-block", width: "100%",
                  transition: "all 0.2s", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }} onMouseEnter={e => { e.currentTarget.style.background = "#1E293B"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#0F172A"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Request Pricing
                </a>
              </div>

            </aside>

          </div>
        </div>
      </div>
    </>
  );
}