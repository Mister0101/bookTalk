"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, BookOpen, Users, Edit3, Share2, Star, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserBook = Database["public"]["Tables"]["user_books"]["Row"] & {
  book: Database["public"]["Tables"]["books"]["Row"];
};
type Club = Database["public"]["Tables"]["clubs"]["Row"] & {
  book?: Database["public"]["Tables"]["books"]["Row"] | null;
};

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#C1344A,#E05070)",
  "linear-gradient(135deg,#5B6EAE,#8094D4)",
  "linear-gradient(135deg,#2E7D32,#66BB6A)",
  "linear-gradient(135deg,#E65100,#FFA726)",
  "linear-gradient(135deg,#6A1B9A,#AB47BC)",
  "linear-gradient(135deg,#00695C,#26A69A)",
];

function BookCover({ url, title, idx, size = "small" }: { url?: string | null; title: string; idx: number; size?: "small" | "medium" }) {
  const w = size === "medium" ? "w-16 h-24" : "w-12 h-18";
  return (
    <div className={`${w} rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center`}
      style={{ background: url ? undefined : COVER_GRADIENTS[idx % COVER_GRADIENTS.length] }}>
      {url
        ? <img src={url} alt={title} className="w-full h-full object-cover" />
        : <BookOpen size={size === "medium" ? 20 : 14} color="rgba(255,255,255,0.7)" />
      }
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [userBooks, setUserBooks] = React.useState<UserBook[]>([]);
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const [editing, setEditing] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editBio, setEditBio] = React.useState("");
  const [editCity, setEditCity] = React.useState("");
  const [editCountry, setEditCountry] = React.useState("");
  const [savingEdit, setSavingEdit] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  React.useEffect(() => { loadProfile(); }, [id]);

  async function loadProfile() {
    setLoading(true);
    const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (error || !profileData) { setNotFound(true); setLoading(false); return; }
    setProfile(profileData);
    setEditName(profileData.name);
    setEditBio(profileData.bio ?? "");
    setEditCity(profileData.city ?? "");
    setEditCountry(profileData.country ?? "");

    const { data: booksData } = await supabase.from("user_books").select("*, book:books(*)")
      .eq("user_id", id).order("created_at", { ascending: false });
    setUserBooks((booksData as UserBook[]) ?? []);

    const { data: memberRows } = await supabase.from("club_members")
      .select("club_id").eq("user_id", id).eq("status", "active");
    if (memberRows?.length) {
      const { data: clubData } = await supabase.from("clubs").select("*, book:books(*)")
        .in("id", memberRows.map((r) => r.club_id));
      setClubs((clubData as Club[]) ?? []);
    }
    setLoading(false);
  }

  async function saveEdit() {
    if (!profile) return;
    setSavingEdit(true);
    await supabase.from("profiles")
      .update({ name: editName, bio: editBio || null, city: editCity || null, country: editCountry || null })
      .eq("id", profile.id);
    setProfile((p) => p ? { ...p, name: editName, bio: editBio, city: editCity, country: editCountry } : p);
    setSavingEdit(false);
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bt-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full animate-spin border-2 border-t-transparent" style={{ borderColor: "var(--bt-primary)" }} />
          <p className="text-sm" style={{ color: "var(--bt-muted)" }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bt-bg)" }}>
        <span className="text-5xl">👤</span>
        <p className="font-semibold" style={{ color: "var(--bt-text)" }}>Profile not found</p>
        <button onClick={() => router.back()} className="text-sm px-4 py-2 rounded-xl border"
          style={{ borderColor: "var(--bt-border)", color: "var(--bt-muted)" }}>Go back</button>
      </div>
    );
  }

  const isOwn = currentUserId === profile.id;
  const readingBooks  = userBooks.filter((b) => b.status === "reading");
  const plannedBooks  = userBooks.filter((b) => b.status === "planned");
  const finishedBooks = userBooks.filter((b) => b.status === "finished");
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  // Simple XP + streak (will be real once v2 schema columns are added)
  const xp = (profile as any).xp ?? 0;
  const streak = (profile as any).reading_streak ?? 0;
  const yearlyGoal = (profile as any).yearly_goal ?? 24;
  const goalPct = Math.min(100, Math.round((finishedBooks.length / Math.max(yearlyGoal, 1)) * 100));

  return (
    <div className="min-h-screen" style={{ background: "var(--bt-bg)" }}>
      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Main column ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Profile header card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
            {/* Cover banner */}
            <div className="h-28 w-full" style={{ background: "linear-gradient(135deg,#C1344A 0%,#E05070 40%,#F8A0B0 100%)" }} />

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end justify-between -mt-12 mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-2xl text-white"
                  style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : profile.name[0].toUpperCase()
                  }
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                  {isOwn ? (
                    <>
                      <button onClick={() => setEditing(!editing)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors hover:bg-stone-50"
                        style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }}>
                        <Edit3 size={14} /> Edit Profile
                      </button>
                      <button className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors hover:bg-stone-50"
                        style={{ borderColor: "var(--bt-border)", color: "var(--bt-muted)" }}>
                        <Share2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => router.push("/chat")}
                        className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-colors"
                        style={{ background: "var(--bt-primary)" }}>
                        Message
                      </button>
                      <button className="w-8 h-8 rounded-xl flex items-center justify-center border"
                        style={{ borderColor: "var(--bt-border)", color: "var(--bt-muted)" }}>
                        <Share2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {editing ? (
                <div className="space-y-3 mb-4">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-xl text-sm font-semibold border focus:outline-none"
                    style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editCity} onChange={(e) => setEditCity(e.target.value)}
                      placeholder="City" className="px-3 py-2 rounded-xl text-sm border focus:outline-none"
                      style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }} />
                    <input value={editCountry} onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="Country" className="px-3 py-2 rounded-xl text-sm border focus:outline-none"
                      style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }} />
                  </div>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write a short bio…" rows={3}
                    className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none resize-none"
                    style={{ borderColor: "var(--bt-border)", color: "var(--bt-text)" }} />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={savingEdit}
                      className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: "var(--bt-primary)" }}>
                      {savingEdit ? "Saving…" : "Save changes"}
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="px-4 py-1.5 rounded-xl text-sm border"
                      style={{ borderColor: "var(--bt-border)", color: "var(--bt-muted)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold" style={{ color: "var(--bt-text)" }}>{profile.name}</h1>
                  {location && (
                    <p className="flex items-center gap-1 text-sm mt-0.5" style={{ color: "var(--bt-muted)" }}>
                      <MapPin size={13} /> {location}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--bt-text)" }}>{profile.bio}</p>
                  )}
                </>
              )}

              {/* Stats row */}
              <div className="flex gap-6 mt-4 pt-4 border-t" style={{ borderColor: "var(--bt-border)" }}>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--bt-primary)" }}>{finishedBooks.length}</p>
                  <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Books read</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--bt-text)" }}>{readingBooks.length}</p>
                  <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Reading now</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--bt-text)" }}>{clubs.length}</p>
                  <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Book clubs</p>
                </div>
                {streak > 0 && (
                  <div className="text-center">
                    <p className="text-lg font-bold flex items-center gap-1 justify-center" style={{ color: "#E65100" }}>
                      🔥 {streak}
                    </p>
                    <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Day streak</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reading goal progress */}
          <div className="rounded-2xl p-5" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>
                📈 Reading Goal {new Date().getFullYear()}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--bt-primary-light)", color: "var(--bt-primary)" }}>
                {finishedBooks.length} / {yearlyGoal} books
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0EBE9" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${goalPct}%`, background: "linear-gradient(90deg,#C1344A,#E05070)" }} />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--bt-muted)" }}>{goalPct}% complete</p>
          </div>

          {/* Currently Reading */}
          {readingBooks.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--bt-text)" }}>📖 Currently Reading</h2>
              <div className="space-y-3">
                {readingBooks.map(({ book }, i) => (
                  <div key={book.id} className="flex gap-3 items-center">
                    <BookCover url={book.cover_url} title={book.title} idx={i} size="medium" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--bt-text)" }}>{book.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--bt-muted)" }}>{book.author}</p>
                      {book.genres?.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
                          style={{ background: "var(--bt-primary-light)", color: "var(--bt-primary)" }}>
                          {book.genres[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favourite Genres */}
          {profile.favorite_genres.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--bt-text)" }}>🎭 Favourite Genres</h2>
              <div className="flex flex-wrap gap-2">
                {profile.favorite_genres.map((g, i) => (
                  <span key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                    style={{
                      background: i === 0 ? "var(--bt-primary)" : i === 1 ? "#5B6EAE" : i === 2 ? "#2E7D32" : "#F5F0EE",
                      color: i < 3 ? "white" : "var(--bt-text)",
                    }}>
                    <Star size={11} /> {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Want to Read */}
          {plannedBooks.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>🔖 Want to Read</h2>
                <span className="text-xs" style={{ color: "var(--bt-muted)" }}>{plannedBooks.length} books</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                {plannedBooks.map(({ book }, i) => (
                  <div key={book.id} className="flex-shrink-0 w-16">
                    <BookCover url={book.cover_url} title={book.title} idx={i + 2} size="medium" />
                    <p className="text-[10px] mt-1 font-medium text-center line-clamp-2 leading-tight" style={{ color: "var(--bt-text)" }}>{book.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finished books */}
          {finishedBooks.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>✅ Finished</h2>
                <span className="text-xs" style={{ color: "var(--bt-muted)" }}>{finishedBooks.length} books</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                {finishedBooks.map(({ book }, i) => (
                  <div key={book.id} className="flex-shrink-0 w-16">
                    <BookCover url={book.cover_url} title={book.title} idx={i + 1} size="medium" />
                    <p className="text-[10px] mt-1 font-medium text-center line-clamp-2 leading-tight" style={{ color: "var(--bt-text)" }}>{book.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book Clubs */}
          {clubs.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--bt-text)" }}>👥 Book Clubs</h2>
              <div className="space-y-2">
                {clubs.map((club) => (
                  <button key={club.id} onClick={() => router.push(`/clubs/${club.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-stone-50"
                    style={{ border: "1px solid var(--bt-border)" }}>
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: "var(--bt-primary-light)" }}>
                      <BookOpen size={16} style={{ color: "var(--bt-primary)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--bt-text)" }}>{club.name}</p>
                      {club.genre && (
                        <p className="text-xs" style={{ color: "var(--bt-muted)" }}>{club.genre}</p>
                      )}
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--bt-muted)" }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="hidden lg:flex flex-col gap-5 w-64 flex-shrink-0">

          {/* Reading preferences */}
          {(profile.reading_pace || profile.discussion_style || profile.meeting_preference) && (
            <div className="rounded-2xl p-4" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--bt-text)" }}>Reading style</h3>
              {profile.reading_pace && (
                <div className="flex items-center justify-between py-1.5">
                  <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Pace</p>
                  <p className="text-xs font-medium capitalize" style={{ color: "var(--bt-text)" }}>{profile.reading_pace}</p>
                </div>
              )}
              {profile.discussion_style && (
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: "var(--bt-border)" }}>
                  <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Discussion</p>
                  <p className="text-xs font-medium capitalize" style={{ color: "var(--bt-text)" }}>{profile.discussion_style}</p>
                </div>
              )}
              {profile.meeting_preference && (
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: "var(--bt-border)" }}>
                  <p className="text-xs" style={{ color: "var(--bt-muted)" }}>Meetings</p>
                  <p className="text-xs font-medium capitalize" style={{ color: "var(--bt-text)" }}>{profile.meeting_preference}</p>
                </div>
              )}
            </div>
          )}

          {/* Discover more clubs */}
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,#C1344A,#E05070)", color: "white" }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} />
              <h3 className="font-semibold text-sm">Discover Clubs</h3>
            </div>
            <p className="text-xs opacity-80 mb-3">Find readers who love the same books as you.</p>
            <button onClick={() => router.push("/explore")}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white transition-colors hover:bg-rose-50"
              style={{ color: "var(--bt-primary)" }}>
              Browse Book Clubs
            </button>
          </div>

          {/* Add a book CTA (own profile only) */}
          {isOwn && (
            <button onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-colors hover:bg-stone-50"
              style={{ borderColor: "var(--bt-border)", color: "var(--bt-muted)", background: "var(--bt-card)" }}>
              <Plus size={16} style={{ color: "var(--bt-primary)" }} />
              Add book to list
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
