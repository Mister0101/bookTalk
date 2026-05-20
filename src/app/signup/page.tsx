"use client";
// Signup redirects to the unified login/signup page with create account tab pre-selected
import { redirect } from "next/navigation";
export default function SignupPage() {
  redirect("/login");
}
