"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - in production this would call an API
    router.push("/onboarding");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Join BookCircle</h1>
            <p className="text-slate-600">Create your free account and start connecting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Emma Wilson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="text-xs text-slate-600">
              Password must be at least 8 characters long
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Log in
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-amber-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-amber-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
