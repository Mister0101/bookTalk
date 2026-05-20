"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, Edit, Send, Plus, Smile } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"] & { profile?: Profile };
type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  book?: Database["public"]["Tables"]["books"]["Row"];
  members?: Profile[];
  lastMessage?: Message;
};

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = React.useState<Profile | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [containsSpoiler, setContainsSpoiler] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [sendingMessage, setSendingMessage] = React.useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = React.useState<Set<string>>(new Set());
  const [chatSearch, setChatSearch] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<"all" | "unread" | "groups" | "dms">("all");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      supabase.from("profiles").select("*").eq("id", user.id).single()
        .then(({ data }) => setCurrentUser(data));
    });
  }, []);

  React.useEffect(() => {
    if (!currentUser) return;
    loadConversations();
  }, [currentUser]);

  async function loadConversations() {
    setLoading(true);
    const { data: memberRows } = await supabase
      .from("conversation_members").select("conversation_id").eq("user_id", currentUser!.id);
    if (!memberRows?.length) { setLoading(false); return; }

    const ids = memberRows.map((r) => r.conversation_id);
    const { data: rawConvs } = await supabase
      .from("conversations").select("*, book:books(*)").in("id", ids).order("created_at", { ascending: false });
    const convData = rawConvs as (Conversation & { book?: Database["public"]["Tables"]["books"]["Row"] })[] | null;
    if (!convData) { setLoading(false); return; }

    const enriched: Conversation[] = await Promise.all(
      convData.map(async (conv) => {
        const { data: memberProfilesRaw } = await supabase
          .from("conversation_members").select("profile:profiles(*)").eq("conversation_id", conv.id);
        const { data: lastMsgData } = await supabase
          .from("messages").select("*, profile:profiles(*)").eq("conversation_id", conv.id)
          .order("created_at", { ascending: false }).limit(1);
        return {
          ...conv,
          members: (memberProfilesRaw as { profile: Profile }[] | null)?.map((m) => m.profile) ?? [],
          lastMessage: lastMsgData?.[0] as Message | undefined,
        };
      })
    );
    setConversations(enriched);
    setLoading(false);
  }

  React.useEffect(() => {
    if (!activeConv) return;
    supabase.from("messages").select("*, profile:profiles(*)")
      .eq("conversation_id", activeConv.id).order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50);
      });

    const channel = supabase.channel(`msgs:${activeConv.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${activeConv.id}` },
        async (payload) => {
          const { data: p } = await supabase.from("profiles").select("*").eq("id", payload.new.user_id).single();
          setMessages((prev) => [...prev, { ...(payload.new as Message), profile: p ?? undefined }]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConv?.id]);

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv || !currentUser || sendingMessage) return;
    setSendingMessage(true);
    await supabase.from("messages").insert({
      conversation_id: activeConv.id, user_id: currentUser.id,
      content: newMessage.trim(), contains_spoiler: containsSpoiler,
    });
    setNewMessage(""); setContainsSpoiler(false); setSendingMessage(false);
  }

  function convName(conv: Conversation) {
    if (conv.name) return conv.name;
    if (conv.type === "matched" && conv.book) return conv.book.title;
    const others = conv.members?.filter((m) => m.id !== currentUser?.id) ?? [];
    return others.length === 1 ? others[0].name : others.map((m) => m.name.split(" ")[0]).join(", ") || "Chat";
  }

  function convAvatarUrl(conv: Conversation) {
    if (conv.type === "matched") return conv.book?.cover_url ?? null;
    return conv.members?.find((m) => m.id !== currentUser?.id)?.avatar_url ?? null;
  }

  const filtered = conversations.filter((c) => {
    const q = chatSearch.toLowerCase();
    const matchQ = !q || convName(c).toLowerCase().includes(q);
    const matchTab = filterTab === "all" || (filterTab === "groups" && c.type !== "dm") || (filterTab === "dms" && c.type === "dm");
    return matchQ && matchTab;
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bt-bg)" }}>

      {/* ── Chat list panel ── */}
      <div
        className={`flex flex-col border-r ${activeConv ? "hidden md:flex" : "flex"}`}
        style={{ width: 300, minWidth: 300, borderColor: "var(--bt-border)", background: "var(--bt-card)" }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--bt-text)" }}>Chats</h2>
          <button onClick={() => router.push("/match")}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-stone-100">
            <Edit size={16} style={{ color: "var(--bt-primary)" }} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--bt-muted)" }} />
            <input type="text" placeholder="Search chats"
              value={chatSearch} onChange={(e) => setChatSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "#F5F0EE", color: "var(--bt-text)" }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex px-4 gap-1 pb-3">
          {(["all", "unread", "groups", "dms"] as const).map((t) => (
            <button key={t} onClick={() => setFilterTab(t)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize"
              style={{
                background: filterTab === t ? "var(--bt-primary)" : "#F5F0EE",
                color: filterTab === t ? "white" : "var(--bt-muted)",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-sm" style={{ color: "var(--bt-muted)" }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
              <span className="text-4xl">💬</span>
              <p className="text-sm font-medium" style={{ color: "var(--bt-text)" }}>No conversations yet</p>
              <button onClick={() => router.push("/match")}
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
                style={{ background: "var(--bt-primary)" }}>Find Readers</button>
            </div>
          ) : (
            filtered.map((conv) => {
              const active = activeConv?.id === conv.id;
              const name = convName(conv);
              const avatarUrl = convAvatarUrl(conv);
              const lastMsg = conv.lastMessage;
              const isOwn = lastMsg?.user_id === currentUser?.id;
              return (
                <button key={conv.id} onClick={() => setActiveConv(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  style={{ background: active ? "var(--bt-primary-light)" : "transparent" }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F5F0EE"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-base">{conv.type === "group" ? "👥" : name[0]}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--bt-text)" }}>{name}</p>
                      {lastMsg && (
                        <p className="text-[10px] flex-shrink-0 ml-2" style={{ color: "var(--bt-muted)" }}>
                          {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="text-xs truncate" style={{ color: "var(--bt-muted)" }}>
                        {isOwn ? "You: " : ""}{lastMsg.contains_spoiler ? "⚠️ Spoiler" : lastMsg.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create group */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "var(--bt-border)" }}>
          <button onClick={() => router.push("/match")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-stone-50"
            style={{ borderColor: "var(--bt-border)", color: "var(--bt-muted)" }}>
            <Plus size={14} /> Create group chat
          </button>
        </div>
      </div>

      {/* ── Messages panel ── */}
      {activeConv ? (
        <div className={`flex-1 flex flex-col min-w-0 ${activeConv ? "flex" : "hidden md:flex"}`}
          style={{ background: "#FDFAF9" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-white"
            style={{ borderColor: "var(--bt-border)" }}>
            <button className="md:hidden mr-1" onClick={() => setActiveConv(null)}
              style={{ color: "var(--bt-muted)" }}>←</button>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white"
              style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
              {convAvatarUrl(activeConv)
                ? <img src={convAvatarUrl(activeConv)!} alt="" className="w-full h-full object-cover" />
                : <span>{activeConv.type === "group" ? "👥" : convName(activeConv)[0]}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--bt-text)" }}>{convName(activeConv)}</p>
              <p className="text-xs" style={{ color: "var(--bt-muted)" }}>
                {activeConv.members?.length ?? 0} members
                {activeConv.type === "matched" && " · Book Match"}
              </p>
            </div>
            {/* Member avatars */}
            <div className="flex -space-x-2 flex-shrink-0">
              {activeConv.members?.slice(0, 5).map((m) => (
                <div key={m.id} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
                  {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : m.name[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color: "var(--bt-muted)" }}>
                No messages yet. Say hello! 👋
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.user_id === currentUser?.id;
              const spoilerHidden = msg.contains_spoiler && !revealedSpoilers.has(msg.id);
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const showName = !isOwn && (!prevMsg || prevMsg.user_id !== msg.user_id);
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 self-end flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
                      {msg.profile?.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
                    {showName && (
                      <p className="text-xs px-1 mb-1" style={{ color: "var(--bt-muted)" }}>{msg.profile?.name}</p>
                    )}
                    {msg.contains_spoiler && !revealedSpoilers.has(msg.id) ? (
                      <button onClick={() => setRevealedSpoilers((p) => new Set([...p, msg.id]))}
                        className="px-3 py-2 rounded-2xl text-xs font-medium border"
                        style={{ background: "#FFF3E0", borderColor: "#FFD180", color: "#E65100" }}>
                        ⚠️ SPOILER — tap to reveal
                      </button>
                    ) : (
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                        style={{
                          background: isOwn ? "var(--bt-primary)" : "var(--bt-card)",
                          color: isOwn ? "white" : "var(--bt-text)",
                          border: isOwn ? "none" : "1px solid var(--bt-border)",
                        }}>
                        {msg.content}
                      </div>
                    )}
                    {/* Reactions placeholder */}
                    <div className="flex items-center gap-1 mt-0.5 px-1">
                      <p className="text-[10px]" style={{ color: "var(--bt-muted)" }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t bg-white" style={{ borderColor: "var(--bt-border)" }}>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
                style={{ color: "var(--bt-muted)" }}>
                <Plus size={18} />
              </button>
              <div className="flex-1 relative">
                <input type="text"
                  placeholder={`Message ${convName(activeConv)}…`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  className="w-full px-4 py-2.5 rounded-full text-sm focus:outline-none pr-10"
                  style={{ background: "#F5F0EE", color: "var(--bt-text)" }}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--bt-muted)" }}>
                  <Smile size={16} />
                </button>
              </div>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer flex-shrink-0"
                style={{ color: "var(--bt-muted)" }}>
                <input type="checkbox" className="w-3.5 h-3.5" checked={containsSpoiler}
                  onChange={(e) => setContainsSpoiler(e.target.checked)}
                  style={{ accentColor: "var(--bt-primary)" }} />
                Spoiler
              </label>
              <button onClick={sendMessage} disabled={!newMessage.trim() || sendingMessage}
                className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 transition-colors"
                style={{ background: "var(--bt-primary)" }}>
                <Send size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4"
          style={{ background: "#FDFAF9" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--bt-primary-light)" }}>
            <span className="text-3xl">💬</span>
          </div>
          <p className="font-semibold" style={{ color: "var(--bt-text)" }}>Select a conversation</p>
          <p className="text-sm" style={{ color: "var(--bt-muted)" }}>
            or <button onClick={() => router.push("/match")} style={{ color: "var(--bt-primary)", fontWeight: 600 }}>
              find readers
            </button> to start chatting
          </p>
        </div>
      )}

      {/* ── Right: Club details (if group chat) ── */}
      {activeConv && activeConv.type !== "dm" && (
        <div className="hidden xl:flex flex-col w-64 border-l flex-shrink-0 py-4 px-4 gap-4 overflow-y-auto"
          style={{ borderColor: "var(--bt-border)", background: "var(--bt-card)" }}>
          <div>
            <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--bt-text)" }}>About this chat</h3>
            <p className="text-xs" style={{ color: "var(--bt-muted)" }}>
              {activeConv.type === "matched"
                ? "Book match conversation"
                : activeConv.name ?? "Group conversation"}
            </p>
          </div>

          {activeConv.members && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm" style={{ color: "var(--bt-text)" }}>
                  Members ({activeConv.members.length})
                </h3>
              </div>
              <div className="space-y-2">
                {activeConv.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#C1344A,#E05070)" }}>
                      {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : m.name[0]}
                    </div>
                    <p className="text-xs font-medium truncate" style={{ color: "var(--bt-text)" }}>{m.name}</p>
                    {m.id === activeConv.created_by && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0"
                        style={{ background: "var(--bt-primary-light)", color: "var(--bt-primary)" }}>Admin</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeConv.book && (
            <div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--bt-text)" }}>Shared book</h3>
              <div className="flex gap-2.5 p-2.5 rounded-xl"
                style={{ background: "var(--bt-primary-light)", border: "1px solid #F0C8CF" }}>
                {activeConv.book.cover_url && (
                  <img src={activeConv.book.cover_url} alt="" className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold line-clamp-2" style={{ color: "var(--bt-text)" }}>
                    {activeConv.book.title}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--bt-muted)" }}>{activeConv.book.author}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
