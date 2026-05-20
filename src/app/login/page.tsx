"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (tab === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id, name: name || email.split("@")[0] });
        router.push("/onboarding");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bt-bg)" }}>
      {/* ── Left: Form panel ── */}
      <div className="w-full md:w-[440px] flex-shrink-0 flex flex-col px-8 py-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bt-primary)" }}>
            <BookOpen size={20} color="white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight" style={{ color: "var(--bt-text)" }}>BookTalk</p>
            <p className="text-[11px] leading-tight" style={{ color: "var(--bt-muted)" }}>Books. People. Conversations.</p>
          </div>
        </Link>

        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--bt-text)" }}>
          Find your reading people.
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--bt-muted)" }}>
          Connect with readers, discuss books, join clubs, and meet online or in person.
        </p>

        {/* Tabs */}
        <div className="flex mb-6 border-b" style={{ borderColor: "var(--bt-border)" }}>
          <button
            onClick={() => setTab("signin")}
            className="pb-2.5 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors"
            style={{
              borderColor: tab === "signin" ? "var(--bt-primary)" : "transparent",
              color: tab === "signin" ? "var(--bt-primary)" : "var(--bt-muted)",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("signup")}
            className="pb-2.5 px-1 text-sm font-semibold border-b-2 transition-colors"
            style={{
              borderColor: tab === "signup" ? "var(--bt-primary)" : "transparent",
              color: tab === "signup" ? "var(--bt-primary)" : "var(--bt-muted)",
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--bt-text)" }}>
                Your name
              </label>
              <input
                type="text"
                placeholder="Lena Brooks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bt-card)",
                  border: "1px solid var(--bt-border)",
                  color: "var(--bt-text)",
                }}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--bt-text)" }}>Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--bt-muted)" }} />
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)", color: "var(--bt-text)" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--bt-text)" }}>Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--bt-muted)" }} />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)", color: "var(--bt-text)" }}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--bt-muted)" }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {tab === "signin" && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--bt-muted)" }}>
                <input type="checkbox" className="rounded w-4 h-4" style={{ accentColor: "var(--bt-primary)" }} />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium" style={{ color: "var(--bt-primary)" }}>
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl"
              style={{ background: "var(--bt-primary-light)", color: "var(--bt-primary)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: loading ? "#D47080" : "var(--bt-primary)" }}
          >
            {loading ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "var(--bt-border)" }} />
          <span className="text-xs" style={{ color: "var(--bt-muted)" }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: "var(--bt-border)" }} />
        </div>

        <div className="space-y-2.5">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-stone-50"
            style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-stone-50"
            style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Continue with Apple
          </button>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: "var(--bt-muted)" }}>
          By continuing, you agree to BookTalk&apos;s{" "}
          <a href="#" style={{ color: "var(--bt-primary)" }}>Terms of Service</a>
          {" "}and acknowledge our{" "}
          <a href="#" style={{ color: "var(--bt-primary)" }}>Privacy Policy</a>.
        </p>
      </div>

      {/* ── Right: Photo panel ── */}
      <div className="hidden md:flex flex-1 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
        <div className="absolute inset-0" style={{ background: "rgba(30,15,10,0.45)" }} />

        {/* Floating cards */}
        <div className="relative z-10 flex flex-col justify-end p-8 gap-4 w-full">
          {/* Testimonial */}
          <div className="absolute top-8 right-8 left-8 rounded-2xl p-5 shadow-xl"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}>
            <p className="text-sm font-medium mb-3 leading-relaxed" style={{ color: "var(--bt-text)" }}>
              &ldquo;BookTalk helped me find my people and my next favorite read.&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "var(--bt-primary)" }}>L</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--bt-text)" }}>Lena Brooks</p>
                <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Book lover & tea lover 🍵</p>
              </div>
            </div>
          </div>

          {/* Bottom features */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "📖", title: "Discover clubs", desc: "Find your vibe with clubs for every interest and genre." },
              { icon: "💬", title: "Join discussions", desc: "Share thoughts, ask questions, and connect over books." },
              { icon: "📊", title: "Track your reading", desc: "Log books, set goals, and celebrate your reading journey." },
              { icon: "🛡️", title: "Meet safely", desc: "In-app chats and meetups designed for a safe experience." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
                <p className="text-2xl mb-1">{f.icon}</p>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--bt-text)" }}>{f.title}</p>
                <p className="text-[10px]" style={{ color: "var(--bt-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
