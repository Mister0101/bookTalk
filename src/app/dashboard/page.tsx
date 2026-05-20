"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Flame, UserPlus, MessageCircle, Heart, Share2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Club = Database["public"]["Tables"]["clubs"]["Row"];
type Book = Database["public"]["Tables"]["books"]["Row"];
type ClubWithBook = Club & { book: Book | null; memberCount: number };

const TRENDING_GENRES = ["Romance", "Fantasy", "Thriller", "Classics", "Online", "In-person", "Hybrid"];

// Placeholder gradient covers when no cover_url
const COVER_GRADIENTS = [
  "linear-gradient(135deg,#C1344A,#6B1A28)",
  "linear-gradient(135deg,#2C3E50,#4A6B8A)",
  "linear-gradient(135deg,#7B5A3C,#C4956A)",
  "linear-gradient(135deg,#3D6B5A,#7BC4A8)",
  "linear-gradient(135deg,#5A3C7B,#9B7BC4)",
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [myClubs, setMyClubs] = React.useState<ClubWithBook[]>([]);
  const [suggestedClubs, setSuggestedClubs] = React.useState<ClubWithBook[]>([]);
  const [readingCount, setReadingCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) setProfile(prof);

      const { data: memberRows } = await supabase
        .from("club_members").select("club_id").eq("user_id", user.id).eq("status", "active");
      const myClubIds = memberRows?.map((r) => r.club_id) ?? [];

      if (myClubIds.length > 0) {
        const { data: rawClubs } = await supabase
          .from("clubs").select("*, book:books(*)").in("id", myClubIds);
        const clubs = (rawClubs ?? []) as (Club & { book: Book | null })[];
        const { data: mems } = await supabase
          .from("club_members").select("club_id").in("club_id", myClubIds).eq("status", "active");
        const cm: Record<string, number> = {};
        mems?.forEach((m) => { cm[m.club_id] = (cm[m.club_id] ?? 0) + 1; });
        setMyClubs(clubs.map((c) => ({ ...c, memberCount: cm[c.id] ?? 0 })));
      }

      const { data: rawSuggested } = await supabase
        .from("clubs").select("*, book:books(*)")
        .eq("privacy", "public")
        .not("id", "in", myClubIds.length > 0 ? `(${myClubIds.join(",")})` : "(null)")
        .limit(5);
      const suggested = (rawSuggested ?? []) as (Club & { book: Book | null })[];
      const sugIds = suggested.map((c) => c.id);
      if (sugIds.length > 0) {
        const { data: sugMems } = await supabase
          .from("club_members").select("club_id").in("club_id", sugIds).eq("status", "active");
        const sm: Record<string, number> = {};
        sugMems?.forEach((m) => { sm[m.club_id] = (sm[m.club_id] ?? 0) + 1; });
        setSuggestedClubs(suggested.map((c) => ({ ...c, memberCount: sm[c.id] ?? 0 })));
      }

      const { count } = await supabase
        .from("user_books").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("status", "reading");
      setReadingCount(count ?? 0);

      setLoading(false);
    }
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const allFeedClubs = [...myClubs, ...suggestedClubs];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bt-bg)" }}>
      {/* ── Center feed ── */}
      <div className="flex-1 min-w-0 max-w-3xl px-6 py-6">
        {/* Welcome + streak */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bt-text)" }}>
              Welcome back, {profile?.name ?? "Reader"}! 📚
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: "#FFF3E0", color: "#E65100" }}
            >
              <Flame size={14} />
              <span>0 day streak</span>
            </div>
          </div>
        </div>

        {/* Search hero */}
        <div
          className="relative rounded-2xl overflow-hidden mb-5 p-6"
          style={{ background: "linear-gradient(135deg, #2C1810 0%, #5C2E1A 50%, #8B4513 100%)" }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative">
            <h2 className="text-white text-2xl font-bold mb-1">Discover your</h2>
            <h2 className="text-white text-2xl font-bold mb-4">next great conversation</h2>
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="What book do you want to discuss today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white text-sm focus:outline-none"
                style={{ color: "var(--bt-text)" }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--bt-primary)" }}
              >
                <Search size={14} color="white" />
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-3">
              {TRENDING_GENRES.map((g) => (
                <Link key={g} href={`/explore?q=${g}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                  style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(4px)" }}>
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trending clubs horizontal scroll */}
        {suggestedClubs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base" style={{ color: "var(--bt-text)" }}>
                Currently trending book clubs
              </h3>
              <Link href="/explore" className="text-sm flex items-center gap-1"
                style={{ color: "var(--bt-primary)" }}>
                See all clubs <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {suggestedClubs.slice(0, 5).map((club, i) => (
                <Link key={club.id} href={`/clubs/${club.id}`}
                  className="flex-shrink-0 w-32 rounded-xl overflow-hidden group"
                  style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                  <div className="h-20 relative" style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}>
                    {club.book?.cover_url && (
                      <img src={club.book.cover_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold line-clamp-1" style={{ color: "var(--bt-text)" }}>{club.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--bt-muted)" }}>{club.memberCount.toLocaleString()} members</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Discussion feed */}
        {allFeedClubs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
            <div className="text-5xl mb-3">📚</div>
            <h3 className="font-bold text-lg mb-1" style={{ color: "var(--bt-text)" }}>Your feed is empty</h3>
            <p className="text-sm mb-5" style={{ color: "var(--bt-muted)" }}>Join a club to see book discussions here</p>
            <Link href="/explore"
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--bt-primary)" }}>
              Explore Book Clubs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {allFeedClubs.map((club, i) => (
              <DiscussionCard
                key={club.id}
                club={club}
                gradientIdx={i}
                liked={likedPosts.has(club.id)}
                onLike={() => setLikedPosts((prev) => {
                  const n = new Set(prev);
                  n.has(club.id) ? n.delete(club.id) : n.add(club.id);
                  return n;
                })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-72 flex-shrink-0 px-4 py-6 gap-5"
        style={{ borderLeft: "1px solid var(--bt-border)" }}
      >
        {/* Suggested readers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>Suggested readers</h3>
            <button className="text-xs font-medium" style={{ color: "var(--bt-primary)" }}>See all</button>
          </div>
          <div className="space-y-3">
            {[
              { name: "Isabella Greene", handle: "@bella.reads", bio: "Loves fantasy & mythology" },
              { name: "Daniel Kim", handle: "@dan.the.reader", bio: "Thriller addict | King fan" },
              { name: "Sophie Laurent", handle: "@sophies.library", bio: "Classic literature enthusiast" },
            ].map((r) => (
              <div key={r.handle} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
                  {r.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--bt-text)" }}>{r.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--bt-muted)" }}>{r.bio}</p>
                </div>
                <button
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all"
                  style={{ color: "var(--bt-primary)", borderColor: "var(--bt-primary)" }}>
                  <UserPlus size={11} /> Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reading progress */}
        {readingCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>Your reading progress</h3>
              <button className="text-xs font-medium" style={{ color: "var(--bt-primary)" }}>See all</button>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
              <p className="text-sm" style={{ color: "var(--bt-muted)" }}>
                {readingCount} book{readingCount !== 1 ? "s" : ""} currently in progress
              </p>
              <Link href={profile ? `/profile/${profile.id}` : "/login"}
                className="mt-2 inline-block text-sm font-medium"
                style={{ color: "var(--bt-primary)" }}>
                View reading list →
              </Link>
            </div>
          </div>
        )}

        {/* My clubs quick list */}
        {myClubs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>My Clubs</h3>
              <Link href="/explore" className="text-xs font-medium" style={{ color: "var(--bt-primary)" }}>See all</Link>
            </div>
            <div className="space-y-2">
              {myClubs.slice(0, 4).map((club, i) => (
                <Link key={club.id} href={`/clubs/${club.id}`}
                  className="flex items-center gap-2.5 p-2 rounded-lg transition-colors hover:bg-stone-50"
                  style={{ color: "var(--bt-text)" }}>
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}>
                    {club.book?.cover_url && <img src={club.book.cover_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{club.name}</p>
                    <p className="text-xs" style={{ color: "var(--bt-muted)" }}>{club.memberCount} members</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--bt-muted)" }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Create club CTA */}
        <div className="rounded-xl p-4" style={{ background: "var(--bt-primary-light)", border: "1px solid #F0C8CF" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--bt-primary)" }}>Start a book club</p>
          <p className="text-xs mb-3" style={{ color: "#8B4E58" }}>Build your own reading community</p>
          <Link href="/clubs/create"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--bt-primary)" }}>
            + Create Club
          </Link>
        </div>
      </aside>
    </div>
  );
}

function DiscussionCard({
  club, gradientIdx, liked, onLike,
}: {
  club: ClubWithBook;
  gradientIdx: number;
  liked: boolean;
  onLike: () => void;
}) {
  const genre = club.genre ?? "General";
  const meetingLabel = club.meeting_type === "in_person" ? "In-person" : club.meeting_type === "online" ? "Online" : "Hybrid";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
      {/* Book cover banner */}
      <div className="relative h-44 overflow-hidden"
        style={{ background: COVER_GRADIENTS[gradientIdx % COVER_GRADIENTS.length] }}>
        {club.book?.cover_url ? (
          <img src={club.book.cover_url} alt={club.book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-end p-4">
            <div>
              <p className="text-white font-bold text-lg leading-tight">{club.book?.title ?? club.name}</p>
              {club.book?.author && <p className="text-white/70 text-sm">{club.book.author}</p>}
            </div>
          </div>
        )}
        {/* Genre badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ background: "var(--bt-primary)" }}>
            {genre}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/clubs/${club.id}`}>
          <h3 className="font-bold text-base mb-0.5 hover:underline" style={{ color: "var(--bt-text)" }}>{club.name}</h3>
        </Link>
        {club.book && (
          <p className="text-xs mb-2" style={{ color: "var(--bt-muted)" }}>
            Currently reading: <span className="font-medium">{club.book.title}</span> by {club.book.author}
          </p>
        )}
        {club.description && (
          <p className="text-sm line-clamp-2 mb-3" style={{ color: "#4B5563" }}>{club.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--bt-muted)" }}>
          <span>{club.memberCount.toLocaleString()} members</span>
          {club.city && <><span>•</span><span>{club.city}</span></>}
          <span>•</span><span>{meetingLabel}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onLike}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: liked ? "var(--bt-primary)" : "var(--bt-muted)" }}>
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              <span>{liked ? 1 : 0}</span>
            </button>
            <Link href={`/clubs/${club.id}`}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "var(--bt-muted)" }}>
              <MessageCircle size={16} />
              <span>Discuss</span>
            </Link>
            <button className="flex items-center gap-1.5 text-sm" style={{ color: "var(--bt-muted)" }}>
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
          <Link href={`/clubs/${club.id}`}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: "var(--bt-primary)" }}>
            Join discussion
          </Link>
        </div>
      </div>
    </div>
  );
}
