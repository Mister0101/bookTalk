"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { MOCK_USER } from "@/lib/mock-data";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // For demo purposes, consider user logged in if not on login/signup pages
  const isLoggedIn = pathname !== "/login" && pathname !== "/signup" && pathname !== "/";

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-3xl">📚</span>
            <span className="text-xl font-bold text-slate-800">
              Book<span className="text-amber-600">Circle</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "text-amber-600"
                      : "text-slate-700 hover:text-amber-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/explore"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/explore"
                      ? "text-amber-600"
                      : "text-slate-700 hover:text-amber-600"
                  }`}
                >
                  Explore Clubs
                </Link>
                <Link
                  href="/clubs/create"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/clubs/create"
                      ? "text-amber-600"
                      : "text-slate-700 hover:text-amber-600"
                  }`}
                >
                  Create Club
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-stone-200">
                  <Link href="/profile/user_1">
                    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-semibold flex items-center justify-center text-sm">
                        {MOCK_USER.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{MOCK_USER.name}</span>
                    </div>
                  </Link>
                  <Link href="/login">
                    <Button size="sm" variant="ghost">
                      Logout
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/explore"
                  className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
                >
                  Explore Clubs
                </Link>
                <Link href="/login">
                  <Button size="sm" variant="ghost">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" variant="primary">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/explore"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore Clubs
                </Link>
                <Link
                  href="/clubs/create"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Club
                </Link>
                <Link
                  href="/profile/user_1"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/login"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/explore"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore Clubs
                </Link>
                <Link
                  href="/login"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block text-sm font-medium text-slate-700 hover:text-amber-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
