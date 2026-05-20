"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

const ALL_GENRES = [
  "Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance",
  "Historical Fiction", "Literary Fiction", "Horror", "Biography",
  "Self-Help", "Non-Fiction", "Young Adult", "Graphic Novel",
  "Poetry", "Philosophy", "Psychology", "Business", "Travel",
].sort();

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [meetingType, setMeetingType] = React.useState("online");
  const [privacy, setPrivacy] = React.useState("public");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [rules, setRules] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTags.length < 1) { setError("Please select at least one genre."); return; }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: club, error: insertError } = await supabase
      .from("clubs")
      .insert({
        name,
        description: description || null,
        genre: selectedTags[0],
        created_by: user.id,
        privacy: privacy as "public" | "request_to_join" | "invite_only",
        meeting_type: meetingType as "in_person" | "online" | "hybrid",
        city: city || null,
        country: country || null,
        rules: rules || null,
      })
      .select()
      .single();

    if (insertError || !club) {
      setError(insertError?.message ?? "Failed to create club.");
      setLoading(false);
      return;
    }

    // Add creator as host
    await supabase.from("club_members").insert({
      club_id: club.id,
      user_id: user.id,
      role: "host",
      status: "active",
    });

    router.push(`/clubs/${club.id}`);
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
                  { value: "in_person", label: "In Person" },
                  { value: "online", label: "Online" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
                required
              />
              <Select
                label="Privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                options={[
                  { value: "public", label: "Public - Anyone can join" },
                  { value: "request_to_join", label: "Request to Join - Approval required" },
                  { value: "invite_only", label: "Invite Only - Private" },
                ]}
                required
              />
            </div>
          </div>

          {/* Location (conditional) */}
          {(meetingType === "in_person" || meetingType === "hybrid") && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="City" placeholder="Auckland" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="Country" placeholder="New Zealand" value={country} onChange={(e) => setCountry(e.target.value)} />
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
              {ALL_GENRES.map((genre) => (
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
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? "Creating…" : "Create Club"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
