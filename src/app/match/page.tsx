"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Database } from "@/lib/supabase/types";

type Book = Database["public"]["Tables"]["books"]["Row"];
type QueueEntry = Database["public"]["Tables"]["match_queue"]["Row"] & {
  book?: Book;
};

const MATCH_SIZE = 4; // target group size

export default function MatchPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Book[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [queueEntry, setQueueEntry] = React.useState<QueueEntry | null>(null);
  const [queueSize, setQueueSize] = React.useState(0);
  const [matched, setMatched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [myQueue, setMyQueue] = React.useState<QueueEntry[]>([]);

  // ── Auth ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      loadMyQueue(user.id);
    });
  }, []);

  async function loadMyQueue(uid: string) {
    const { data } = await supabase
      .from("match_queue")
      .select("*, book:books(*)")
      .eq("user_id", uid)
      .eq("matched", false)
      .order("queued_at", { ascending: false });
    setMyQueue((data as QueueEntry[]) ?? []);
  }

  // ── Book search ──────────────────────────────────────────────────────
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearch(q);
    setSelectedBook(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) { setResults([]); return; }
    searchTimeout.current = setTimeout(() => searchBooks(q), 350);
  }

  async function searchBooks(q: string) {
    setSearching(true);
    const { data } = await supabase
      .from("books")
      .select("*")
      .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
      .limit(8);
    setResults(data ?? []);
    setSearching(false);
  }

  // ── Join queue / instant match ───────────────────────────────────────
  async function joinQueue(book: Book) {
    if (!userId) return;
    setLoading(true);
    setSelectedBook(book);
    setResults([]);
    setSearch(book.title);

    // Check if user already in queue for this book
    const { data: existing } = await supabase
      .from("match_queue")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", book.id)
      .eq("matched", false)
      .maybeSingle();

    if (existing) {
      setQueueEntry(existing as QueueEntry);
      await pollForMatch(book.id, existing.id);
      setLoading(false);
      return;
    }

    // Count current queue for this book (excluding current user)
    const { count } = await supabase
      .from("match_queue")
      .select("*", { count: "exact", head: true })
      .eq("book_id", book.id)
      .eq("matched", false);

    const currentCount = count ?? 0;
    setQueueSize(currentCount + 1);

    // Insert into queue
    const { data: entry } = await supabase
      .from("match_queue")
      .insert({ user_id: userId, book_id: book.id, matched: false })
      .select()
      .single();

    if (!entry) { setLoading(false); return; }
    setQueueEntry(entry as QueueEntry);

    // Instant match: if enough people in queue now
    if (currentCount + 1 >= MATCH_SIZE) {
      await attemptInstantMatch(book.id);
    } else {
      // Subscribe for realtime updates
      await pollForMatch(book.id, entry.id);
    }
    setLoading(false);
  }

  async function attemptInstantMatch(bookId: string) {
    // Get MATCH_SIZE unmatched entries for this book
    const { data: candidates } = await supabase
      .from("match_queue")
      .select("*")
      .eq("book_id", bookId)
      .eq("matched", false)
      .order("queued_at", { ascending: true })
      .limit(MATCH_SIZE);

    if (!candidates || candidates.length < MATCH_SIZE) {
      await pollForMatch(bookId, queueEntry?.id ?? "");
      return;
    }

    // Find the book details
    const { data: bookData } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    // Create a matched conversation
    const { data: conv } = await supabase
      .from("conversations")
      .insert({
        type: "matched",
        name: `📖 ${bookData?.title ?? "Book"} Discussion`,
        book_id: bookId,
        created_by: candidates[0].user_id,
      })
      .select()
      .single();

    if (!conv) return;

    // Add all matched users as members
    await supabase.from("conversation_members").insert(
      candidates.map((c) => ({ conversation_id: conv.id, user_id: c.user_id }))
    );

    // Mark all queue entries as matched
    await supabase
      .from("match_queue")
      .update({ matched: true, conversation_id: conv.id })
      .in("id", candidates.map((c) => c.id));

    setMatched(true);
    setTimeout(() => router.push("/chat"), 2000);
  }

  async function pollForMatch(bookId: string, entryId: string) {
    // Subscribe to realtime changes on this queue entry
    const channel = supabase
      .channel(`match:${entryId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_queue",
          filter: `id=eq.${entryId}`,
        },
        (payload) => {
          if (payload.new.matched) {
            setMatched(true);
            supabase.removeChannel(channel);
            setTimeout(() => router.push("/chat"), 2000);
          }
        }
      )
      .subscribe();

    // Also update queue size periodically
    const interval = setInterval(async () => {
      const { count } = await supabase
        .from("match_queue")
        .select("*", { count: "exact", head: true })
        .eq("book_id", bookId)
        .eq("matched", false);
      setQueueSize(count ?? 0);

      // If we now have enough, try to match
      if ((count ?? 0) >= MATCH_SIZE) {
        clearInterval(interval);
        await attemptInstantMatch(bookId);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }

  async function leaveQueue(entryId: string) {
    await supabase.from("match_queue").delete().eq("id", entryId);
    setQueueEntry(null);
    setSelectedBook(null);
    setSearch("");
    setQueueSize(0);
    if (userId) loadMyQueue(userId);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 to-stone-100 px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* ── Matched state ─────────────────────────────────────────── */}
        {matched && (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center animate-pulse">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">You're matched!</h2>
            <p className="text-slate-600">Taking you to your new group chat…</p>
          </div>
        )}

        {/* ── Search state ──────────────────────────────────────────── */}
        {!matched && !queueEntry && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🔍</div>
              <h1 className="text-2xl font-bold text-slate-800">What book do you want to discuss today?</h1>
              <p className="text-slate-500 mt-2 text-sm">
                We'll match you with {MATCH_SIZE - 1}–{MATCH_SIZE} other readers who want to talk about the same book.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 text-base"
                placeholder="Search by title or author…"
                value={search}
                onChange={handleSearchChange}
              />
              {searching && (
                <div className="absolute right-4 top-3.5 text-slate-400 text-sm">Searching…</div>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                {results.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => joinQueue(book)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left border-b border-stone-100 last:border-0"
                  >
                    <div className="w-10 h-14 bg-stone-200 rounded flex-shrink-0 overflow-hidden">
                      {book.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{book.title}</p>
                      <p className="text-xs text-slate-500">{book.author}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {book.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {search.trim() && !searching && results.length === 0 && (
              <div className="mt-4 text-center text-slate-500 text-sm py-6">
                No books found for &quot;{search}&quot;
                <br />
                <span className="text-xs text-slate-400">Books are added when clubs or users add them</span>
              </div>
            )}

            {/* Active queue entries */}
            {myQueue.length > 0 && (
              <div className="mt-6 pt-6 border-t border-stone-200">
                <p className="text-sm font-semibold text-slate-600 mb-3">Your active requests:</p>
                <div className="space-y-2">
                  {myQueue.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{entry.book?.title ?? "Book"}</p>
                        <p className="text-xs text-slate-500">Waiting for readers…</p>
                      </div>
                      <button
                        onClick={() => leaveQueue(entry.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── In-queue waiting state ─────────────────────────────────── */}
        {!matched && queueEntry && selectedBook && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Finding readers…</h2>
            <p className="text-slate-500 text-sm mb-6">
              Looking for people who want to discuss <strong>{selectedBook.title}</strong>
            </p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{queueSize} / {MATCH_SIZE} readers</span>
                <span>Need {Math.max(0, MATCH_SIZE - queueSize)} more</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (queueSize / MATCH_SIZE) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center mb-6">
              {Array.from({ length: MATCH_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    i < queueSize ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-400"
                  }`}
                >
                  {i < queueSize ? "📖" : "?"}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-6">
              You'll be notified as soon as enough readers are found. You can close this page and come back.
            </p>

            <Button variant="ghost" onClick={() => leaveQueue(queueEntry.id)}>
              Leave queue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
