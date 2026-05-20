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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
  const [readingPace, setReadingPace] = React.useState("1-book");
  const [discussionStyle, setDiscussionStyle] = React.useState("casual");
  const [meetingPreference, setMeetingPreference] = React.useState("online");
  const [allowGroupMatching, setAllowGroupMatching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error } = await supabase
      .from("profiles")
      .update({
        city: city || null,
        country: country || null,
        bio: bio || null,
        favorite_genres: selectedGenres,
        reading_pace: readingPace,
        discussion_style: discussionStyle,
        meeting_preference: meetingPreference,
        allow_group_matching: allowGroupMatching,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Step {step} of 3</span>
              <span className="text-sm font-medium text-slate-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Preferences */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to BookCircle! 👋</h2>
              <p className="text-slate-600 mb-6">Let's personalize your experience</p>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="City" placeholder="Auckland" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input label="Country" placeholder="New Zealand" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <Textarea
                  label="Bio"
                  placeholder="Tell us a bit about yourself and your reading interests..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Favorite Genres */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">What do you love to read?</h2>
              <p className="text-slate-600 mb-6">Select your favorite genres (choose at least 3)</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {ALL_GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedGenres.includes(genre)
                        ? "bg-amber-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {selectedGenres.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    Selected ({selectedGenres.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.map((genre) => (
                      <Badge key={genre} variant="primary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reading Preferences */}
          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Reading Preferences</h2>
              <p className="text-slate-600 mb-6">Help us find the perfect clubs and matches for you</p>

              <div className="space-y-4">
                <Select
                  label="Reading Pace"
                  value={readingPace}
                  onChange={(e) => setReadingPace(e.target.value)}
                  options={[
                    { value: "1-book", label: "1 book per month" },
                    { value: "2-books", label: "2-3 books per month" },
                    { value: "4-books", label: "4+ books per month" },
                  ]}
                />
                <Select
                  label="Discussion Style"
                  value={discussionStyle}
                  onChange={(e) => setDiscussionStyle(e.target.value)}
                  options={[
                    { value: "casual", label: "Casual - Light discussions" },
                    { value: "moderate", label: "Moderate - Mix of both" },
                    { value: "analytical", label: "Analytical - Deep dives" },
                  ]}
                />
                <Select
                  label="Meeting Preference"
                  value={meetingPreference}
                  onChange={(e) => setMeetingPreference(e.target.value)}
                  options={[
                    { value: "in-person", label: "In-person meetings" },
                    { value: "online", label: "Online meetings" },
                    { value: "hybrid", label: "Both (hybrid)" },
                  ]}
                />

                {/* Group matching opt-in */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-amber-600"
                      checked={allowGroupMatching}
                      onChange={(e) => setAllowGroupMatching(e.target.checked)}
                    />
                    <div>
                      <p className="font-medium text-slate-800">Allow book matching</p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Let BookCircle add you to group chats with other readers who want to discuss the same book. You can change this anytime in Settings.
                      </p>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-stone-200">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                variant="primary"
                onClick={() => setStep(step + 1)}
                className="flex-1"
                disabled={step === 2 && selectedGenres.length < 3}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleComplete}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Saving…" : "Complete Setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
