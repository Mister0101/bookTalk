"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar, MobileTabBar } from "./Navbar";
import { createClient } from "@/lib/supabase/client";

// Pages that use a full-screen layout without the sidebar
const NO_SIDEBAR = ["/login", "/signup", "/onboarding", "/auth"];

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = NO_SIDEBAR.some((p) => pathname.startsWith(p));
  const supabase = createClient();
  const [userId, setUserId] = React.useState<string | undefined>();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bt-bg)" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:block flex-shrink-0" style={{ width: "var(--bt-sidebar-w)" }}>
        <Navbar />
      </div>

      {/* Main content */}
      <main
        className="flex-1 min-w-0 pb-16 md:pb-0"
        style={{ minHeight: "100vh" }}
      >
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden">
        <MobileTabBar userId={userId} />
      </div>
    </div>
  );
}
