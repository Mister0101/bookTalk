"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { SafetyNotice } from "@/components/ui/SafetyNotice";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Database } from "@/lib/supabase/types";

type Club = Database["public"]["Tables"]["clubs"]["Row"];
type Book = Database["public"]["Tables"]["books"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"] & { profile?: Profile };
type ClubMember = Database["public"]["Tables"]["club_members"]["Row"] & { profile?: Profile };

const meetingTypeMap: Record<string, string> = {
  in_person: "📍 In Person", online: "💻 Online", hybrid: "🌐 Hybrid",
};
const privacyMap: Record<string, string> = {
  public: "Public", request_to_join: "Request to Join", invite_only: "Invite Only",
};

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const supabase = createClient();

  const [club, setClub] = React.useState<Club | null>(null);
  const [book, setBook] = React.useState<Book | null>(null);
  const [host, setHost] = React.useState<Profile | null>(null);
  const [members, setMembers] = React.useState<ClubMember[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentUser, setCurrentUser] = React.useState<Profile | null>(null);
  const [isMember, setIsMember] = React.useState(false);
  const [myRole, setMyRole] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [newMessage, setNewMessage] = React.useState("");
  const [containsSpoiler, setContainsSpoiler] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [joining, setJoining] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // ── Load everything ────────────────────────────────────────────────────
  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      // Load club
      const { data: clubData } = await supabase
        .from("clubs").select("*").eq("id", clubId).single();
      if (!clubData) { setLoading(false); return; }
      setClub(clubData);

      // Load book
      if (clubData.book_id) {
        const { data: bookData } = await supabase
          .from("books").select("*").eq("id", clubData.book_id).single();
        if (bookData) setBook(bookData);
      }

      // Load host profile
      const { data: hostData } = await supabase
        .from("profiles").select("*").eq("id", clubData.created_by).single();
      if (hostData) setHost(hostData);

      // Load members with profiles
      const { data: rawMemberData } = await supabase
        .from("club_members")
        .select("*, profile:profiles(*)")
        .eq("club_id", clubId)
        .eq("status", "active");
      type MemberRow = Database["public"]["Tables"]["club_members"]["Row"] & { profile: Profile | null };
      const memberData = (rawMemberData ?? []) as MemberRow[];
      const typedMembers = memberData.map((m) => ({
        ...m,
        profile: m.profile ?? undefined,
      }));
      setMembers(typedMembers);

      // Current user
      if (user) {
        const { data: prof } = await supabase
          .from("profiles").select("*").eq("id", user.id).single();
        if (prof) setCurrentUser(prof);

        const myMembership = typedMembers.find((m) => m.user_id === user.id);
        if (myMembership) {
          setIsMember(true);
          setMyRole(myMembership.role);
        }
      }

      // Load discussion messages
      const { data: msgData } = await supabase
        .from("messages")
        .select("*, profile:profiles(*)")
        .eq("conversation_id", clubId) // club discussions use club id as conv id placeholder
        .order("created_at", { ascending: true });
      // Note: if no conversation exists for this club, messages will be empty

      setLoading(false);
    }
    load();
  }, [clubId]);

  // ── Realtime for messages ──────────────────────────────────────────────
  React.useEffect(() => {
    if (!activeTab === false) return; // always subscribe
    const channel = supabase
      .channel(`club-discussion:${clubId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
      }, async (payload) => {
        const { data: prof } = await supabase
          .from("profiles").select("*").eq("id", payload.new.user_id).single();
        setMessages((prev) => [
          ...prev,
          { ...(payload.new as Message), profile: prof ?? undefined },
        ]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clubId]);

  async function handleJoin() {
    if (!currentUser) { router.push("/login"); return; }
    setJoining(true);
    await supabase.from("club_members").insert({
      club_id: clubId,
      user_id: currentUser.id,
      role: "member",
      status: club?.privacy === "public" ? "active" : "pending",
    });
    setIsMember(true);
    setMyRole("member");
    setJoining(false);
  }

  async function handleLeave() {
    if (!currentUser) return;
    await supabase.from("club_members")
      .delete()
      .eq("club_id", clubId)
      .eq("user_id", currentUser.id);
    setIsMember(false);
    setMyRole(null);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Club not found</h2>
          <Link href="/explore"><Button variant="primary">Explore Clubs</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-100 to-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {book?.cover_url && (
              <div className="w-full md:w-48 h-72 bg-white rounded-lg shadow-lg overflow-hidden flex-shrink-0">
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">{club.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-600 text-sm">
                    <span>{meetingTypeMap[club.meeting_type] ?? club.meeting_type}</span>
                    {(club.city || club.country) && (
                      <span>• {[club.city, club.country].filter(Boolean).join(", ")}</span>
                    )}
                    <span>•</span>
                    <Badge variant="default">{privacyMap[club.privacy] ?? club.privacy}</Badge>
                    <span>• {members.length}{club.member_limit ? `/${club.member_limit}` : ""} members</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!currentUser ? (
                    <Link href="/login"><Button variant="primary">Log in to Join</Button></Link>
                  ) : isMember ? (
                    myRole !== "host" && (
                      <Button variant="ghost" size="sm" onClick={handleLeave}>Leave</Button>
                    )
                  ) : (
                    <Button variant="primary" onClick={handleJoin} disabled={joining}>
                      {joining ? "Joining…" : club.privacy === "request_to_join" ? "Request to Join" : "Join Club"}
                    </Button>
                  )}
                </div>
              </div>

              {book && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-stone-200 inline-block">
                  <p className="text-sm text-amber-800 font-medium mb-1">Currently Reading</p>
                  <h3 className="text-lg font-bold text-slate-800">{book.title}</h3>
                  <p className="text-slate-600 text-sm">by {book.author}</p>
                </div>
              )}

              <p className="text-slate-700 mb-4">{club.description}</p>

              {club.genre && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary">{club.genre}</Badge>
                </div>
              )}

              {host && (
                <div className="flex items-center gap-3">
                  <Avatar name={host.name} src={host.avatar_url ?? undefined} size="sm" />
                  <div>
                    <p className="text-sm text-slate-500">Hosted by</p>
                    <p className="font-medium text-slate-800">{host.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 bg-white sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {["overview", "discussion", "members"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">About This Club</h2>
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <p className="text-slate-700 mb-4">{club.description}</p>
                {club.rules && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Club Rules</h3>
                    <p className="text-slate-700 whitespace-pre-line">{club.rules}</p>
                  </div>
                )}
              </div>
            </section>
            {club.meeting_type !== "online" && <SafetyNotice />}
          </div>
        )}

        {/* Discussion */}
        {activeTab === "discussion" && (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Discussion</h2>
            {isMember ? (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-slate-500">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map((msg) => {
                  const isOwn = msg.user_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <Avatar name={msg.profile?.name ?? "?"} src={msg.profile?.avatar_url ?? undefined} size="sm" />
                      <div className={`max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                        {!isOwn && (
                          <p className="text-xs text-slate-500 mb-1">{msg.profile?.name}</p>
                        )}
                        {msg.contains_spoiler ? (
                          <SpoilerMessage content={msg.content} />
                        ) : (
                          <div className={`px-4 py-2 rounded-2xl text-sm ${
                            isOwn ? "bg-amber-600 text-white" : "bg-white border border-stone-200 text-slate-800"
                          }`}>
                            {msg.content}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />

                {/* Send message */}
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={containsSpoiler}
                        onChange={(e) => setContainsSpoiler(e.target.checked)}
                        className="rounded"
                      />
                      <span>Contains spoilers</span>
                    </label>
                    <Button size="sm" variant="primary" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                      {sending ? "Sending…" : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Members Only</h3>
                <p className="text-slate-600 mb-6">Join this club to participate in discussions</p>
                <Button variant="primary" onClick={handleJoin} disabled={joining}>
                  {joining ? "Joining…" : "Join Club"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Members ({members.length})</h2>
            {members.length === 0 ? (
              <p className="text-slate-600">No members yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
                    <Avatar name={member.profile?.name ?? "?"} src={member.profile?.avatar_url ?? undefined} size="md" />
                    <div>
                      <Link href={`/profile/${member.user_id}`}>
                        <p className="font-medium text-slate-800 hover:text-amber-600">{member.profile?.name ?? "Unknown"}</p>
                      </Link>
                      <p className="text-sm text-slate-500">
                        {member.role === "host" ? "Host" : member.role === "co_host" ? "Co-host" : "Member"}
                        {member.profile?.city && ` • ${member.profile.city}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  async function sendMessage() {
    if (!newMessage.trim() || !currentUser || sending) return;
    setSending(true);

    // Get or create a conversation for this club
    let convId: string | null = null;
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("type", "group")
      .eq("created_by", club?.created_by ?? "")
      .eq("name", club?.name ?? "")
      .single();

    if (existingConv) {
      convId = existingConv.id;
    } else {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ type: "group", name: club?.name, created_by: currentUser.id, book_id: club?.book_id })
        .select("id")
        .single();
      if (newConv) {
        convId = newConv.id;
        // Add all club members to this conversation
        const memberInserts = members.map((m) => ({
          conversation_id: convId as string,
          user_id: m.user_id,
        }));
        await supabase.from("conversation_members").insert(memberInserts);
      }
    }

    if (convId) {
      const { data: msg } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          user_id: currentUser.id,
          content: newMessage.trim(),
          contains_spoiler: containsSpoiler,
        })
        .select("*")
        .single();

      if (msg) {
        setMessages((prev) => [...prev, { ...msg, profile: currentUser }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    }

    setNewMessage("");
    setContainsSpoiler(false);
    setSending(false);
  }
}

function SpoilerMessage({ content }: { content: string }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <button
      onClick={() => setRevealed(!revealed)}
      className={`px-4 py-2 rounded-2xl text-sm border transition-all ${
        revealed
          ? "bg-amber-50 border-amber-200 text-slate-800"
          : "bg-slate-200 border-slate-300 text-slate-500 blur-sm select-none"
      }`}
      title={revealed ? "Click to hide spoiler" : "Click to reveal spoiler"}
    >
      {revealed ? content : "⚠️ Spoiler — tap to reveal"}
    </button>
  );
}
