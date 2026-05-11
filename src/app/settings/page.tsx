"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MOCK_USER } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Settings</h1>

        {/* Account Settings */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <Input label="Name" value={MOCK_USER.name} />
            <Input label="Email" type="email" value={MOCK_USER.email} />
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="City" value={MOCK_USER.city || ""} />
              <Input label="Country" value={MOCK_USER.country || ""} />
            </div>
            <Textarea label="Bio" value={MOCK_USER.bio || ""} rows={4} />
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Change Password</h2>
          <div className="space-y-4">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm New Password" type="password" />
            <Button variant="primary">Update Password</Button>
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
                <p className="font-medium text-slate-800">New club recommendations</p>
                <p className="text-sm text-slate-600">Discover new clubs based on your interests</p>
              </div>
            </label>
            <Button variant="primary">Save Preferences</Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Danger Zone</h2>
          <p className="text-slate-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}
