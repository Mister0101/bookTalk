"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Users, MapPin, Laptop, Globe, ChevronRight, Grid3X3, List } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Database } from "@/lib/supabase/types";

type Club = Database["public"]["Tables"]["clubs"]["Row"];
type Book = Database["public"]["Tables"]["books"]["Row"];
type ClubWithBook = Club & { book: Book | null; memberCount: number };

const FILTER_GENRES = ["Romance", "Fantasy", "Thriller", "Classics", "Mystery", "Sci-Fi", "Historical"];
const FILTER_MEETING = [
  { value: "", label: "All" },
  { value: "online", label: "Online", icon: Laptop },
  { value: "in_person", label: "In-person", icon: MapPin },
  { value: "hybrid", label: "Hybrid", icon: Globe },
];
const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "members", label: "Most members" },
];

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#C1344A,#6B1A28)",
  "linear-gradient(135deg,#2C3E50,#4A6B8A)",
  "linear-gradient(135deg,#7B5A3C,#C4956A)",
  "linear-gradient(135deg,#3D6B5A,#7BC4A8)",
  "linear-gradient(135deg,#5A3C7B,#9B7BC4)",
  "linear-gradient(135deg,#1A3C5A,#4A8BAA)",
];

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [clubs, setClubs] = React.useState<ClubWithBook[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [meetingFilter, setMeetingFilter] = React.useState("");
  const [genreFilter, setGenreFilter] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState("popular");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [myClubIds, setMyClubIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: mems } = await supabase
          .from("club_members").select("club_id").eq("user_id", user.id).eq("status", "active");
        setMyClubIds(new Set(mems?.map((m) => m.club_id) ?? []));
      }

      const { data: rawClubs } = await supabase
        .from("clubs").select("*, book:books(*)").eq("privacy", "public");
      const clubData = (rawClubs ?? []) as (Club & { book: Book | null })[];

      if (clubData.length > 0) {
        const ids = clubData.map((c) => c.id);
        const { data: mems } = await supabase
          .from("club_members").select("club_id").in("club_id", ids).eq("status", "active");
        const cm: Record<string, number> = {};
        mems?.forEach((m) => { cm[m.club_id] = (cm[m.club_id] ?? 0) + 1; });
        setClubs(clubData.map((c) => ({ ...c, memberCount: cm[c.id] ?? 0 })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleGenre = (g: string) =>
    setGenreFilter((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const filtered = clubs
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) || c.genre?.toLowerCase().includes(q);
      const matchMeeting = !meetingFilter || c.meeting_type === meetingFilter;
      const matchGenre = genreFilter.length === 0 ||
        (c.genre && genreFilter.map((g) => g.toLowerCase()).includes(c.genre.toLowerCase()));
      return matchSearch && matchMeeting && matchGenre;
    })
    .sort((a, b) => {
      if (sortBy === "members" || sortBy === "popular") return b.memberCount - a.memberCount;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const featured = clubs.slice(0, 3);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bt-bg)" }}>
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-0.5" style={{ color: "var(--bt-text)" }}>Book Clubs</h1>
          <p className="text-sm" style={{ color: "var(--bt-muted)" }}>Find your people. Read more. Talk books.</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--bt-muted)" }} />
            <input
              type="text"
              placeholder="Search book clubs, genres, or books"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                background: "var(--bt-card)",
                border: "1px solid var(--bt-border)",
                color: "var(--bt-text)",
              }}
            />
          </div>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bt-primary)" }}>
            <Search size={16} color="white" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTER_GENRES.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1"
              style={{
                background: genreFilter.includes(g) ? "var(--bt-primary-light)" : "var(--bt-card)",
                borderColor: genreFilter.includes(g) ? "var(--bt-primary)" : "var(--bt-border)",
                color: genreFilter.includes(g) ? "var(--bt-primary)" : "var(--bt-muted)",
              }}>
              ♥ {g}
            </button>
          ))}
          {FILTER_MEETING.filter((f) => f.value).map((f) => {
            const Icon = f.icon!;
            return (
              <button key={f.value} onClick={() => setMeetingFilter(meetingFilter === f.value ? "" : f.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1"
                style={{
                  background: meetingFilter === f.value ? "var(--bt-primary-light)" : "var(--bt-card)",
                  borderColor: meetingFilter === f.value ? "var(--bt-primary)" : "var(--bt-border)",
                  color: meetingFilter === f.value ? "var(--bt-primary)" : "var(--bt-muted)",
                }}>
                <Icon size={11} /> {f.label}
              </button>
            );
          })}
        </div>

        {/* Count + sort + view */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: "var(--bt-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--bt-text)" }}>{filtered.length}</span> book clubs found
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm" style={{ color: "var(--bt-muted)" }}>
              Sort by:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-medium border-0 bg-transparent focus:outline-none cursor-pointer"
                style={{ color: "var(--bt-text)" }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: "var(--bt-border)" }}>
              <button onClick={() => setViewMode("grid")} className="p-1.5 transition-colors"
                style={{ background: viewMode === "grid" ? "var(--bt-primary-light)" : "var(--bt-card)", color: viewMode === "grid" ? "var(--bt-primary)" : "var(--bt-muted)" }}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode("list")} className="p-1.5 transition-colors"
                style={{ background: viewMode === "list" ? "var(--bt-primary-light)" : "var(--bt-card)", color: viewMode === "list" ? "var(--bt-primary)" : "var(--bt-muted)" }}>
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Club grid */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
            <div className="text-5xl mb-3">📚</div>
            <h3 className="font-bold text-lg mb-1" style={{ color: "var(--bt-text)" }}>No clubs found</h3>
            <p className="text-sm mb-5" style={{ color: "var(--bt-muted)" }}>Try different filters or create the first one!</p>
            <Link href="/clubs/create"
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--bt-primary)" }}>
              + Create Club
            </Link>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {filtered.map((club, i) => (
              viewMode === "grid"
                ? <ClubGridCard key={club.id} club={club} idx={i} isMember={myClubIds.has(club.id)} />
                : <ClubListCard key={club.id} club={club} idx={i} isMember={myClubIds.has(club.id)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 px-4 py-6 gap-5"
        style={{ borderLeft: "1px solid var(--bt-border)" }}>

        {/* Featured */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>Featured Clubs</h3>
            <button className="text-xs" style={{ color: "var(--bt-primary)" }}>See all</button>
          </div>
          <div className="space-y-2">
            {featured.map((club, i) => {
              const isMember = myClubIds.has(club.id);
              const privacy = club.privacy;
              return (
                <div key={club.id} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                  style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}>
                    {club.book?.cover_url && <img src={club.book.cover_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--bt-text)" }}>{club.name}</p>
                    <p className="text-xs" style={{ color: "var(--bt-muted)" }}>
                      {club.genre ?? "General"} • {club.memberCount} members
                    </p>
                  </div>
                  <Link href={`/clubs/${club.id}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex-shrink-0"
                    style={{
                      background: isMember ? "var(--bt-primary-light)" : "var(--bt-primary)",
                      color: isMember ? "var(--bt-primary)" : "white",
                    }}>
                    {isMember ? "View" : privacy === "request_to_join" ? "Request" : "Join"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create club CTA */}
        <div className="rounded-xl p-4" style={{ background: "var(--bt-primary-light)", border: "1px solid #F0C8CF" }}>
          <p className="text-sm font-medium mb-2" style={{ color: "#6B3040" }}>
            Start a book club and build your reading community.
          </p>
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

function MeetingIcon({ type }: { type: string }) {
  if (type === "in_person") return <><MapPin size={11} /> In-person</>;
  if (type === "hybrid") return <><Globe size={11} /> Hybrid</>;
  return <><Laptop size={11} /> Online</>;
}

function ClubGridCard({ club, idx, isMember }: { club: ClubWithBook; idx: number; isMember: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
      {/* Cover */}
      <div className="relative h-36 overflow-hidden"
        style={{ background: COVER_GRADIENTS[idx % COVER_GRADIENTS.length] }}>
        {club.book?.cover_url
          ? <img src={club.book.cover_url} alt="" className="w-full h-full object-cover" />
          : <div className="absolute inset-0 flex items-end p-3">
              <p className="text-white font-bold text-sm leading-tight line-clamp-2">{club.name}</p>
            </div>
        }
        {club.genre && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ background: "rgba(193,52,74,0.85)" }}>
            {club.genre}
          </span>
        )}
      </div>

      <div className="p-4">
        <Link href={`/clubs/${club.id}`}>
          <h3 className="font-bold text-sm mb-0.5 hover:underline line-clamp-1" style={{ color: "var(--bt-text)" }}>
            {club.name}
          </h3>
        </Link>
        <p className="text-xs mb-2" style={{ color: "var(--bt-muted)" }}>
          {club.genre ?? "General"}
        </p>
        {club.description && (
          <p className="text-xs line-clamp-2 mb-3" style={{ color: "#4B5563" }}>{club.description}</p>
        )}

        <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: "var(--bt-muted)" }}>
          <span className="flex items-center gap-1"><Users size={10} /> {club.memberCount}</span>
          {club.city && <span className="flex items-center gap-1"><MapPin size={10} /> {club.city}</span>}
          <span className="flex items-center gap-1"><MeetingIcon type={club.meeting_type} /></span>
        </div>

        <Link href={`/clubs/${club.id}`}
          className="flex items-center justify-center w-full py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: isMember ? "var(--bt-primary-light)" : "var(--bt-primary)",
            color: isMember ? "var(--bt-primary)" : "white",
          }}>
          {isMember ? "View Club" : club.privacy === "request_to_join" ? "Request to Join" : "Join Club"}
        </Link>
      </div>
    </div>
  );
}

function ClubListCard({ club, idx, isMember }: { club: ClubWithBook; idx: number; isMember: boolean }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl transition-shadow hover:shadow-sm"
      style={{ background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
      <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0"
        style={{ background: COVER_GRADIENTS[idx % COVER_GRADIENTS.length] }}>
        {club.book?.cover_url && <img src={club.book.cover_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/clubs/${club.id}`}>
          <h3 className="font-bold text-sm hover:underline" style={{ color: "var(--bt-text)" }}>{club.name}</h3>
        </Link>
        <p className="text-xs mb-1" style={{ color: "var(--bt-muted)" }}>
          {club.genre ?? "General"} • {club.memberCount} members
        </p>
        {club.description && (
          <p className="text-xs line-clamp-2" style={{ color: "#4B5563" }}>{club.description}</p>
        )}
      </div>
      <Link href={`/clubs/${club.id}`}
        className="self-center flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: isMember ? "var(--bt-primary-light)" : "var(--bt-primary)",
          color: isMember ? "var(--bt-primary)" : "white",
        }}>
        {isMember ? "View" : club.privacy === "request_to_join" ? "Request" : "Join"}
      </Link>
    </div>
  );
}
