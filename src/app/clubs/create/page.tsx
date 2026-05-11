"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { mockBooks } from "@/lib/mock-data";

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [meetingType, setMeetingType] = React.useState("");
  const [privacy, setPrivacy] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  const allGenres = Array.from(
    new Set(mockBooks.flatMap((book) => book.genres))
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock create - in production this would call an API
    router.push("/dashboard");
  };

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Create a Book Club</h1>
          <p className="text-lg text-slate-600">
            Build your reading community and connect with fellow book lovers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Club Name"
                placeholder="e.g., Auckland Fantasy Fans"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Textarea
                label="Description"
                placeholder="Tell potential members about your club..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Meeting Settings */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Meeting Settings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Meeting Type"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                options={[
                  { value: "IN_PERSON", label: "In Person" },
                  { value: "ONLINE", label: "Online" },
                  { value: "HYBRID", label: "Hybrid" },
                ]}
                required
              />
              <Select
                label="Privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                options={[
                  { value: "PUBLIC", label: "Public - Anyone can join" },
                  { value: "REQUEST_TO_JOIN", label: "Request to Join - Approval required" },
                  { value: "INVITE_ONLY", label: "Invite Only - Private" },
                ]}
                required
              />
            </div>
          </div>

          {/* Location (conditional) */}
          {(meetingType === "IN_PERSON" || meetingType === "HYBRID") && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="City" placeholder="Auckland" />
                <Input label="Country" placeholder="New Zealand" />
              </div>
            </div>
          )}

          {/* Genres & Tags */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Genres & Tags</h2>
            <p className="text-sm text-slate-600 mb-3">
              Select genres that best represent your club (choose at least 3)
            </p>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleTag(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(genre)
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-slate-600">Selected:</span>
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Rules & Guidelines */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Club Rules (Optional)</h2>
            <Textarea
              placeholder="Add any specific rules or guidelines for your club members..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Create Club
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
