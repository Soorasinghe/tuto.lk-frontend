"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from "firebase/auth";

// --- SVG Icons ---
const IconGoogle = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
);

const IconAlert = () => (
  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [agreed, setAgreed] = useState(false);

  // Smart Error & Success State
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [successMsg, setSuccessMsg] = useState("");

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({ email: "", password: "", general: "" }); 
    setSuccessMsg("");
    setAgreed(false); 
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: "", password: "", general: "" });
    setSuccessMsg("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Verify Email Check
        if (!user.emailVerified) {
          await auth.signOut();
          setErrors(prev => ({ ...prev, general: "Please verify your email address before logging in. We've sent a link to your inbox." }));
          setLoading(false);
          return;
        }

        // 🔥 Route Admin to Admin Dashboard, Teacher to Teacher Dashboard
        // 🔥 Route Admin to Admin Dashboard, Teacher to Teacher Dashboard
        try {
          const res = await fetch(`${API_URL}/api/teachers/${user.uid}`, {
            cache: 'no-store', // Forces Next.js to fetch fresh data
            headers: { 'Cache-Control': 'no-cache' }
          });
          const json = await res.json();
          
          console.log("LOGIN CHECK DATA:", json.data); // Look at your browser console!

          if (json.success && json.data.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (fetchErr) {
          console.error("Failed to fetch user role, defaulting to dashboard:", fetchErr);
          router.push("/dashboard");
        }

      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send Verification Email
        try {
          await sendEmailVerification(user);
        } catch (emailErr) {
          console.error("Firebase failed to send verification email:", emailErr);
        }

        await fetch(`${API_URL}/api/teachers/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: user.uid, 
            name: name || "New Tutor", 
            phone: "Update via Dashboard", 
            email: user.email,
            termsAccepted: true,
            termsAcceptedAt: new Date().toISOString()
          }),
        });

        await auth.signOut();
        setIsLogin(true);
        setSuccessMsg("Account created successfully! Please check your email to verify your account before logging in.");
      }
    } catch (err: any) {
      console.error(err);
      const code = err.code;
      
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrors(prev => ({ ...prev, general: "We couldn't find an account with that email and password combination. Please try again." }));
      } else if (code === 'auth/email-already-in-use') {
        setErrors(prev => ({ ...prev, email: "This email is already registered. Please log in instead." }));
      } else if (code === 'auth/weak-password') {
        setErrors(prev => ({ ...prev, password: "Your password must be at least 6 characters long." }));
      } else if (code === 'auth/invalid-email') {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
      } else if (code === 'auth/too-many-requests') {
        setErrors(prev => ({ ...prev, general: "Too many failed login attempts. Please wait a few minutes and try again." }));
      } else {
        setErrors(prev => ({ ...prev, general: "Something went wrong on our end. Please try again." }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({ email: "", password: "", general: "" });
    setSuccessMsg("");
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const details = getAdditionalUserInfo(userCredential);
      
      if (details?.isNewUser) {
        await fetch(`${API_URL}/api/teachers/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: user.uid, 
            name: user.displayName || "New Tutor", 
            phone: "Update via Dashboard", 
            email: user.email,
            termsAccepted: true,
            termsAcceptedAt: new Date().toISOString()
          }),
        });
        router.push("/dashboard");
      }  else {
        // 🔥 Route Returning Google User based on Admin Role
        try {
          const res = await fetch(`${API_URL}/api/teachers/${user.uid}`, {
            cache: 'no-store', // Forces Next.js to fetch fresh data
            headers: { 'Cache-Control': 'no-cache' }
          });
          const json = await res.json();
          
          console.log("GOOGLE LOGIN CHECK DATA:", json.data); // Look at your browser console!

          if (json.success && json.data.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (fetchErr) {
          console.error("Failed to fetch user role, defaulting to dashboard:", fetchErr);
          router.push("/dashboard");
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrors(prev => ({ ...prev, general: "Google login failed. Please try again or use your email." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FA] font-sans relative overflow-hidden">
      
      {/* Left Column: The Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        
        <Link href="/" className="absolute top-8 left-8 sm:left-16 text-2xl font-black text-blue-600 tracking-tighter">
          Tuto.lk
        </Link>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-gray-500 font-medium mb-8">
            {isLogin ? "Log in to manage your premium tutor profile and view student leads." : "Join Sri Lanka's fastest growing premium tuition platform."}
          </p>

          {errors.general && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold mb-6 border border-red-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <IconAlert />
              <p>{errors.general}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-bold mb-6 border border-green-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <IconCheck />
              <p>{successMsg}</p>
            </div>
          )}

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || (!isLogin && !agreed)}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-900 font-bold text-lg py-3.5 rounded-xl hover:bg-gray-50 transition shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconGoogle />
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-black placeholder-gray-500"
                  placeholder="e.g., Ruwan Perera"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition font-medium text-black placeholder-gray-500 ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                placeholder="teacher@example.com"
              />
              {errors.email && <p className="mt-2 text-sm text-red-500 font-bold animate-in fade-in">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition font-medium text-black placeholder-gray-500 ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-2 text-sm text-red-500 font-bold animate-in fade-in">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 font-medium cursor-pointer leading-relaxed">
                  I agree to the <Link href="/terms" target="_blank" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (!isLogin && !agreed)}
              className="w-full bg-[#0B1120] text-white font-bold text-lg py-4 rounded-xl hover:bg-black transition shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Authenticating..." : (isLogin ? "Log In to Dashboard" : "Create Premium Profile")}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              type="button"
              onClick={toggleMode} 
              className="text-gray-500 hover:text-blue-600 font-bold transition text-sm"
            >
              {isLogin ? "Don't have an account? Sign up here." : "Already have an account? Log in."}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1120] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Grow your teaching business on autopilot.
          </h2>
          <p className="text-xl text-slate-400 font-medium">
            Join thousands of students searching for their perfect tutor every day.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">100% Verified Leads</p>
                  <p className="text-slate-400 text-sm font-medium">Connect directly with students.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}