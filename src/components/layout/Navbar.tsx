"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Search, MessageCircle, BookOpen, User, Bookmark,
  Bell, PlusCircle, ChevronDown, Settings, LogOut, Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NavUser = {
  id: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
};

function Avi({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #C1344A, #E05070)",
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

type NavItem = {
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  badgeKey?: "chats" | "notifs";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: Home,          label: "Home" },
  { href: "/explore",   icon: Search,        label: "Search" },
  { href: "/chat",      icon: MessageCircle, label: "Chats",         badgeKey: "chats" },
  { href: "/explore",   icon: BookOpen,      label: "Book Clubs" },
  { href: "/profile",   icon: User,          label: "Profile" },
  { href: "/match",     icon: Bookmark,      label: "Saved" },
  { href: "/settings",  icon: Bell,          label: "Notifications", badgeKey: "notifs" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = React.useState<NavUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [unreadChats, setUnreadChats] = React.useState(0);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  React.useEffect(() => {
    async function load(uid: string) {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, bio, avatar_url")
        .eq("id", uid)
        .single();
      if (data) setUser(data as NavUser);

      // Unread conversation count as proxy
      const { count } = await supabase
        .from("conversation_members")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);
      setUnreadChats(count ?? 0);
    }

    supabase.auth.getUser().then(({ data: { user: u } }) => { if (u) load(u.id); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setUser(null); return; }
      load(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/explore" && pathname.startsWith(href + "/"));

  const badges: Record<string, number> = { chats: unreadChats, notifs: 0 };

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col bg-white border-r z-40 overflow-y-auto"
      style={{ width: "var(--bt-sidebar-w)", borderColor: "var(--bt-border)" }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--bt-primary)" }}
          >
            <BookOpen size={18} color="white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-bold text-[15px] leading-tight" style={{ color: "var(--bt-text)" }}>
              BookTalk
            </p>
            <p className="text-[10px] leading-tight" style={{ color: "var(--bt-muted)" }}>
              Books. People. Conversations.
            </p>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badgeKey }) => {
          const active = isActive(href === "/profile" ? `/profile/${user?.id ?? ""}` : href);
          const resolvedHref = href === "/profile" && user ? `/profile/${user.id}` : href;
          const badge = badgeKey ? badges[badgeKey] : 0;
          return (
            <Link
              key={label}
              href={resolvedHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
              style={{
                background: active ? "var(--bt-primary-light)" : "transparent",
                color: active ? "var(--bt-primary)" : "var(--bt-muted)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "#F5F0EE";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-sm font-medium flex-1" style={{ color: active ? "var(--bt-primary)" : "#374151" }}>
                {label}
              </span>
              {badge > 0 && (
                <span
                  className="text-[11px] font-bold text-white min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                  style={{ background: "var(--bt-primary)" }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Create Club button */}
      {user && (
        <div className="px-4 py-3 flex-shrink-0">
          <Link
            href="/clubs/create"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--bt-primary)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bt-primary-dark)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bt-primary)"; }}
          >
            <PlusCircle size={16} />
            Create Club
          </Link>
        </div>
      )}

      {/* User card */}
      {user ? (
        <div
          className="mx-3 mb-4 p-3 rounded-xl border flex-shrink-0"
          style={{ background: "#FDFAF9", borderColor: "var(--bt-border)" }}
          ref={userMenuRef}
        >
          <div className="flex items-center gap-2.5">
            <Avi name={user.name} src={user.avatar_url} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--bt-text)" }}>
                {user.name}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--bt-muted)" }}>
                {user.bio ?? "BookTalk Reader"}
              </p>
            </div>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="p-1 rounded-lg transition-colors hover:bg-stone-100"
            >
              <ChevronDown size={14} style={{ color: "var(--bt-muted)" }} />
            </button>
          </div>

          {/* XP bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--bt-muted)" }}>
              <span>BookTalk Reader · Lv 1</span>
              <span>0 / 500 XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bt-border)" }}>
              <div className="h-1.5 rounded-full w-0 transition-all" style={{ background: "var(--bt-primary)" }} />
            </div>
          </div>

          {/* Dropdown */}
          {userMenuOpen && (
            <div
              className="absolute bottom-[calc(100%+4px)] left-3 right-3 bg-white rounded-xl shadow-xl border py-1 z-50"
              style={{ borderColor: "var(--bt-border)" }}
            >
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-stone-50 transition-colors"
                style={{ color: "var(--bt-text)" }}
                onClick={() => setUserMenuOpen(false)}
              >
                <User size={15} style={{ color: "var(--bt-muted)" }} /> My Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-stone-50 transition-colors"
                style={{ color: "var(--bt-text)" }}
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={15} style={{ color: "var(--bt-muted)" }} /> Settings
              </Link>
              <div className="border-t my-1" style={{ borderColor: "var(--bt-border)" }} />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-red-50"
                style={{ color: "#C1344A" }}
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 pb-5 flex-shrink-0 space-y-2">
          <Link
            href="/signup"
            className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--bt-primary)" }}
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-medium border"
            style={{ color: "var(--bt-text)", borderColor: "var(--bt-border)" }}
          >
            Log in
          </Link>
        </div>
      )}
    </aside>
  );
}

// ── Mobile bottom tab (used in ClientShell) ──────────────────────────────
export function MobileTabBar({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Search" },
    { href: "/chat", icon: MessageCircle, label: "Chats" },
    { href: "/explore", icon: BookOpen, label: "Clubs" },
    { href: userId ? `/profile/${userId}` : "/login", icon: User, label: "Profile" },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t"
      style={{ borderColor: "var(--bt-border)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center h-14">
        {tabs.map(({ href, icon: Icon, label }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
            style={{ color: isActive(href) ? "var(--bt-primary)" : "var(--bt-muted)" }}
          >
            <Icon size={22} strokeWidth={isActive(href) ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
