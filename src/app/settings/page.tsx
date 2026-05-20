"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwSaving, setPwSaving] = React.useState(false);
  const [pwMsg, setPwMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (prof) {
        setName(prof.name ?? "");
        setCity(prof.city ?? "");
        setCountry(prof.country ?? "");
        setBio(prof.bio ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile() {
    if (!userId) return;
    setProfileSaving(true);
    setProfileMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({ name, city, country, bio })
      .eq("id", userId);
    if (error) {
      setProfileMsg({ ok: false, text: error.message });
    } else {
      setProfileMsg({ ok: true, text: "Profile saved!" });
    }
    setProfileSaving(false);
  }

  async function changePassword() {
    setPwMsg(null);
    if (!newPassword || !confirmPassword) {
      setPwMsg({ ok: false, text: "Please fill in all password fields." }); return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "Passwords do not match." }); return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ ok: false, text: "Password must be at least 6 characters." }); return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwMsg({ ok: false, text: error.message });
    } else {
      setPwMsg({ ok: true, text: "Password updated!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwSaving(false);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Settings</h1>

        {/* Account Settings */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} disabled />
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            {profileMsg && (
              <p className={`text-sm ${profileMsg.ok ? "text-green-600" : "text-red-600"}`}>
                {profileMsg.text}
              </p>
            )}
            <Button variant="primary" onClick={saveProfile} disabled={profileSaving}>
              {profileSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Change Password</h2>
          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {pwMsg && (
              <p className={`text-sm ${pwMsg.ok ? "text-green-600" : "text-red-600"}`}>
                {pwMsg.text}
              </p>
            )}
            <Button variant="primary" onClick={changePassword} disabled={pwSaving}>
              {pwSaving ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" />
              <div>
                <p className="font-medium text-slate-800">Email notifications</p>
                <p className="text-sm text-slate-600">Receive email updates about your clubs</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" />
              <div>
                <p className="font-medium text-slate-800">Meeting reminders</p>
                <p className="text-sm text-slate-600">Get notified before upcoming meetings</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium text-slate-800">New book suggestions</p>
                <p className="text-sm text-slate-600">Get notified when clubs suggest new books</p>
              </div>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-slate-600 text-sm mb-4">
            To delete your account, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
