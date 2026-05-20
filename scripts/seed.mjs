// ============================================================
// BookTalk — Seed Script
// Run: node scripts/seed.mjs
// Creates 6 demo users, 15 books, 4 clubs, chats + messages
// All demo users have password: BookTalk123!
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (handles leading spaces and spaces around =)
const envPath = resolve(__dirname, "../.env.local");
const env = {};
readFileSync(envPath, "utf8")
  .split("\n")
  .forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) return;
    const key = line.substring(0, eqIdx).trim();
    const val = line.substring(eqIdx + 1).trim();
    if (key) env[key] = val;
  });

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────
function ok(label, error) {
  if (error) { console.error(`  ❌ ${label}:`, error.message); return false; }
  console.log(`  ✅ ${label}`);
  return true;
}

async function upsertUser(email, password, meta) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);
  if (found) {
    console.log(`  ♻️  User exists: ${email}`);
    return found.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: meta,
  });
  if (error) { console.error(`  ❌ createUser ${email}:`, error.message); return null; }
  console.log(`  ✅ Created user: ${email}`);
  return data.user.id;
}

// ── DATA DEFINITIONS ──────────────────────────────────────

const USERS = [
  {
    email: "emma@booktalk.demo", password: "BookTalk123!",
    profile: {
      name: "Emma Sullivan", bio: "Fantasy & Sci-Fi fanatic. Obsessed with world-building and complex magic systems. 🧙‍♀️",
      city: "London", country: "UK",
      favorite_genres: ["Fantasy", "Science Fiction", "Epic Fantasy"],
      reading_pace: "fast", discussion_style: "analytical", meeting_preference: "online",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
  },
  {
    email: "james@booktalk.demo", password: "BookTalk123!",
    profile: {
      name: "James Chen", bio: "Mystery & Thriller enthusiast. If there's a plot twist, I probably saw it coming. 🔍",
      city: "New York", country: "USA",
      favorite_genres: ["Mystery", "Thriller", "Crime Fiction"],
      reading_pace: "moderate", discussion_style: "casual", meeting_preference: "online",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
  },
  {
    email: "sophia@booktalk.demo", password: "BookTalk123!",
    profile: {
      name: "Sophia Patel", bio: "Literary fiction lover and occasional romance reader. Tea > coffee. 📚",
      city: "Toronto", country: "Canada",
      favorite_genres: ["Literary Fiction", "Contemporary", "Romance"],
      reading_pace: "slow", discussion_style: "emotional", meeting_preference: "hybrid",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    },
  },
  {
    email: "marcus@booktalk.demo", password: "BookTalk123!",
    profile: {
      name: "Marcus Brown", bio: "History buff turned bookworm. Historical fiction is my time machine. 🏛️",
      city: "Chicago", country: "USA",
      favorite_genres: ["Historical Fiction", "Non-fiction", "Biography"],
      reading_pace: "moderate", discussion_style: "analytical", meeting_preference: "in_person",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
  },
  {
    email: "aisha@booktalk.demo", password: "BookTalk123!",
    profile: {
      name: "Aisha Johnson", bio: "YA and Fantasy girlie. Collector of unfinished series. ✨",
      city: "Atlanta", country: "USA",
      favorite_genres: ["Young Adult", "Fantasy", "Paranormal"],
      reading_pace: "fast", discussion_style: "casual", meeting_preference: "online",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
    },
  },
  {
    email: "luca@booktalk.demo", password: "BookTalk123!",
    profile: {
      name: "Luca Ferrari", bio: "Classics and literary fiction are my love language. Proust is my comfort read. 🇮🇹",
      city: "Milan", country: "Italy",
      favorite_genres: ["Classics", "Literary Fiction", "European Literature"],
      reading_pace: "slow", discussion_style: "philosophical", meeting_preference: "in_person",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luca",
    },
  },
];

const BOOKS = [
  { title: "The Name of the Wind",        author: "Patrick Rothfuss",   genres: ["Fantasy", "Epic Fantasy"],         cover_url: "https://covers.openlibrary.org/b/id/8372035-L.jpg",   description: "A hero recounts his dramatic childhood and magical education in a story told across three days." },
  { title: "Mistborn: The Final Empire",  author: "Brandon Sanderson",  genres: ["Fantasy", "Epic Fantasy"],         cover_url: "https://covers.openlibrary.org/b/id/8235135-L.jpg",   description: "In a world of ash and mist, a young thief joins a crew to overthrow an immortal ruler." },
  { title: "A Court of Thorns and Roses", author: "Sarah J. Maas",      genres: ["Fantasy", "Romance", "Young Adult"], cover_url: "https://covers.openlibrary.org/b/id/10518905-L.jpg", description: "A huntress is brought to a magical land and discovers secrets that could destroy all she loves." },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson",  genres: ["Mystery", "Thriller", "Crime Fiction"], cover_url: "https://covers.openlibrary.org/b/id/8739161-L.jpg", description: "A journalist and a hacker investigate a decades-old disappearance tied to a powerful family." },
  { title: "Gone Girl",                   author: "Gillian Flynn",      genres: ["Thriller", "Mystery"],             cover_url: "https://covers.openlibrary.org/b/id/8231856-L.jpg",   description: "On their fifth wedding anniversary, a woman disappears and suspicion falls on her husband." },
  { title: "Big Little Lies",             author: "Liane Moriarty",     genres: ["Mystery", "Contemporary"],         cover_url: "https://covers.openlibrary.org/b/id/10109323-L.jpg",  description: "Three women's lives unravel at a school fundraiser, culminating in a death." },
  { title: "All the Light We Cannot See", author: "Anthony Doerr",      genres: ["Historical Fiction", "Literary Fiction"], cover_url: "https://covers.openlibrary.org/b/id/8758027-L.jpg", description: "The lives of a blind French girl and a German boy converge in WWII-occupied France." },
  { title: "The Pillars of the Earth",    author: "Ken Follett",        genres: ["Historical Fiction"],              cover_url: "https://covers.openlibrary.org/b/id/8264706-L.jpg",   description: "A saga of love, ambition and war set around the building of a cathedral in 12th-century England." },
  { title: "The Kite Runner",             author: "Khaled Hosseini",    genres: ["Literary Fiction", "Contemporary"], cover_url: "https://covers.openlibrary.org/b/id/8241856-L.jpg",  description: "A wealthy Afghan boy navigates guilt, redemption and friendship across decades and continents." },
  { title: "Normal People",               author: "Sally Rooney",       genres: ["Literary Fiction", "Contemporary", "Romance"], cover_url: "https://covers.openlibrary.org/b/id/10208360-L.jpg", description: "Two Irish students navigate an unlikely relationship as they grow from adolescents into adults." },
  { title: "Project Hail Mary",           author: "Andy Weir",          genres: ["Science Fiction"],                 cover_url: "https://covers.openlibrary.org/b/id/12591289-L.jpg",  description: "An astronaut wakes up alone in deep space with no memory — and the fate of Earth in his hands." },
  { title: "Dune",                        author: "Frank Herbert",      genres: ["Science Fiction", "Epic Fantasy"], cover_url: "https://covers.openlibrary.org/b/id/8225261-L.jpg",   description: "On a desert planet, a young nobleman rises to lead a revolution against an oppressive empire." },
  { title: "Beach Read",                  author: "Emily Henry",        genres: ["Romance", "Contemporary"],         cover_url: "https://covers.openlibrary.org/b/id/10499346-L.jpg",  description: "Two writers with opposite genres swap challenges for the summer — and unexpectedly fall for each other." },
  { title: "The Midnight Library",        author: "Matt Haig",          genres: ["Literary Fiction", "Science Fiction"], cover_url: "https://covers.openlibrary.org/b/id/12584874-L.jpg", description: "Between life and death, a woman discovers a library of infinite alternate lives she could have lived." },
  { title: "Pride and Prejudice",         author: "Jane Austen",        genres: ["Classics", "Romance"],             cover_url: "https://covers.openlibrary.org/b/id/8739488-L.jpg",   description: "The witty and romantic story of Elizabeth Bennet and the proud Mr. Darcy in Regency-era England." },
];

// ── MAIN ──────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱  BookTalk Seed — starting...\n");

  // ── 1. Create auth users ────────────────────────────────
  console.log("👤  Creating users…");
  const userIds = [];
  for (const u of USERS) {
    const id = await upsertUser(u.email, u.password, { name: u.profile.name });
    userIds.push(id);
  }
  if (userIds.some((id) => !id)) { console.error("\n❌  Aborting — some users failed to create."); process.exit(1); }

  const [emmId, jamesId, sophiaId, marcusId, aishaId, lucaId] = userIds;

  // ── 2. Upsert profiles ──────────────────────────────────
  console.log("\n📋  Upserting profiles…");
  for (let i = 0; i < USERS.length; i++) {
    const { error } = await supabase.from("profiles").upsert({
      id: userIds[i], email: USERS[i].email, ...USERS[i].profile,
    }, { onConflict: "id" });
    ok(`Profile: ${USERS[i].profile.name}`, error);
  }

  // ── 3. Insert books ─────────────────────────────────────
  console.log("\n📚  Inserting books…");
  const { data: booksData, error: booksErr } = await supabase
    .from("books").upsert(BOOKS, { onConflict: "isbn" }).select("id, title");
  // isbn is null so use title-based check
  let books = booksData;
  if (booksErr || !books?.length) {
    // Try fetching existing ones
    const { data: existing } = await supabase.from("books").select("id, title");
    books = existing ?? [];
    if (books.length === 0) {
      // Insert one by one ignoring conflicts
      for (const b of BOOKS) {
        const { data: row } = await supabase.from("books").insert(b).select("id, title").single();
        if (row) books.push(row);
      }
    }
  }
  console.log(`  ✅ ${books.length} books ready`);

  function bookId(title) {
    return books.find((b) => b.title === title)?.id;
  }

  // ── 4. User reading lists ───────────────────────────────
  console.log("\n📖  Building reading lists…");
  const userBookRows = [
    // Emma — Fantasy reader
    { user_id: emmId,    book_id: bookId("The Name of the Wind"),        status: "reading" },
    { user_id: emmId,    book_id: bookId("Mistborn: The Final Empire"),   status: "finished" },
    { user_id: emmId,    book_id: bookId("Dune"),                         status: "finished" },
    { user_id: emmId,    book_id: bookId("A Court of Thorns and Roses"),  status: "planned" },
    { user_id: emmId,    book_id: bookId("Project Hail Mary"),            status: "planned" },
    // James — Mystery reader
    { user_id: jamesId,  book_id: bookId("The Girl with the Dragon Tattoo"), status: "reading" },
    { user_id: jamesId,  book_id: bookId("Gone Girl"),                    status: "finished" },
    { user_id: jamesId,  book_id: bookId("Big Little Lies"),              status: "finished" },
    { user_id: jamesId,  book_id: bookId("The Midnight Library"),         status: "planned" },
    // Sophia — Literary / Romance
    { user_id: sophiaId, book_id: bookId("Normal People"),                status: "reading" },
    { user_id: sophiaId, book_id: bookId("The Kite Runner"),              status: "finished" },
    { user_id: sophiaId, book_id: bookId("Beach Read"),                   status: "finished" },
    { user_id: sophiaId, book_id: bookId("Pride and Prejudice"),          status: "finished" },
    { user_id: sophiaId, book_id: bookId("All the Light We Cannot See"),  status: "planned" },
    // Marcus — Historical / Non-fiction
    { user_id: marcusId, book_id: bookId("The Pillars of the Earth"),     status: "reading" },
    { user_id: marcusId, book_id: bookId("All the Light We Cannot See"),  status: "finished" },
    { user_id: marcusId, book_id: bookId("The Kite Runner"),              status: "finished" },
    { user_id: marcusId, book_id: bookId("Dune"),                         status: "planned" },
    // Aisha — YA / Fantasy
    { user_id: aishaId,  book_id: bookId("A Court of Thorns and Roses"),  status: "reading" },
    { user_id: aishaId,  book_id: bookId("The Name of the Wind"),         status: "finished" },
    { user_id: aishaId,  book_id: bookId("Mistborn: The Final Empire"),   status: "planned" },
    { user_id: aishaId,  book_id: bookId("The Midnight Library"),         status: "planned" },
    // Luca — Classics / Literary
    { user_id: lucaId,   book_id: bookId("Pride and Prejudice"),          status: "reading" },
    { user_id: lucaId,   book_id: bookId("Normal People"),                status: "finished" },
    { user_id: lucaId,   book_id: bookId("The Kite Runner"),              status: "finished" },
    { user_id: lucaId,   book_id: bookId("All the Light We Cannot See"),  status: "planned" },
  ].filter((r) => r.book_id); // skip any with missing book

  for (const row of userBookRows) {
    const { error } = await supabase.from("user_books").upsert(row, { onConflict: "user_id,book_id" });
    if (error) console.error("  ❌ user_book:", error.message, row);
  }
  console.log(`  ✅ ${userBookRows.length} user-book rows`);

  // ── 5. Book clubs ───────────────────────────────────────
  console.log("\n🏛️  Creating clubs…");
  const clubDefs = [
    {
      name: "Fantasy Readers Circle",
      description: "A welcoming space for epic fantasy fans. We read everything from Tolkien to modern SFF. Dragons, magic systems, and world-building discussions welcome!",
      genre: "Fantasy", privacy: "public", meeting_type: "online",
      created_by: emmId, book_id: bookId("The Name of the Wind"),
      city: null, country: null, member_limit: 30,
    },
    {
      name: "Mystery & Thriller Addicts",
      description: "Obsessed with whodunits, psychological thrillers and crime fiction. No spoilers without a warning! 🔍",
      genre: "Mystery", privacy: "public", meeting_type: "online",
      created_by: jamesId, book_id: bookId("Gone Girl"),
      city: null, country: null, member_limit: 25,
    },
    {
      name: "Contemporary Lit Book Club",
      description: "Exploring modern literary fiction from around the world. We love emotionally complex stories and unreliable narrators.",
      genre: "Literary Fiction", privacy: "public", meeting_type: "hybrid",
      created_by: sophiaId, book_id: bookId("Normal People"),
      city: "Toronto", country: "Canada", member_limit: 20,
    },
    {
      name: "The Classics Society",
      description: "Reading literature that has stood the test of time. Monthly meetings to discuss enduring works from ancient Greece to the 20th century.",
      genre: "Classics", privacy: "request_to_join", meeting_type: "in_person",
      created_by: lucaId, book_id: bookId("Pride and Prejudice"),
      city: "Milan", country: "Italy", member_limit: 15,
    },
  ];

  const clubIds = [];
  for (const club of clubDefs) {
    const { data, error } = await supabase.from("clubs").insert(club).select("id").single();
    if (ok(`Club: ${club.name}`, error)) clubIds.push(data.id);
    else clubIds.push(null);
  }
  const [fantasyClubId, mysteryClubId, litClubId, classicsClubId] = clubIds;

  // ── 6. Club members ─────────────────────────────────────
  console.log("\n👥  Adding club members…");
  const memberRows = [
    // Fantasy Readers Circle (host: Emma)
    { club_id: fantasyClubId, user_id: emmId,    role: "host",   status: "active" },
    { club_id: fantasyClubId, user_id: aishaId,  role: "member", status: "active" },
    { club_id: fantasyClubId, user_id: jamesId,  role: "member", status: "active" },
    { club_id: fantasyClubId, user_id: sophiaId, role: "member", status: "active" },
    // Mystery & Thriller Addicts (host: James)
    { club_id: mysteryClubId, user_id: jamesId,  role: "host",   status: "active" },
    { club_id: mysteryClubId, user_id: emmId,    role: "member", status: "active" },
    { club_id: mysteryClubId, user_id: sophiaId, role: "member", status: "active" },
    { club_id: mysteryClubId, user_id: marcusId, role: "member", status: "active" },
    // Contemporary Lit (host: Sophia)
    { club_id: litClubId,     user_id: sophiaId, role: "host",   status: "active" },
    { club_id: litClubId,     user_id: emmId,    role: "member", status: "active" },
    { club_id: litClubId,     user_id: lucaId,   role: "co_host",status: "active" },
    { club_id: litClubId,     user_id: marcusId, role: "member", status: "active" },
    { club_id: litClubId,     user_id: aishaId,  role: "member", status: "active" },
    // The Classics Society (host: Luca)
    { club_id: classicsClubId,user_id: lucaId,   role: "host",   status: "active" },
    { club_id: classicsClubId,user_id: sophiaId, role: "member", status: "active" },
    { club_id: classicsClubId,user_id: marcusId, role: "member", status: "active" },
  ].filter((r) => r.club_id);

  for (const row of memberRows) {
    const { error } = await supabase.from("club_members").upsert(row, { onConflict: "club_id,user_id" });
    if (error) console.error("  ❌ club_member:", error.message);
  }
  console.log(`  ✅ ${memberRows.length} memberships`);

  // ── 7. Conversations ────────────────────────────────────
  console.log("\n💬  Creating conversations…");

  // Group chat: Fantasy Readers Circle
  const { data: fantasyChat } = await supabase.from("conversations").insert({
    type: "group", name: "Fantasy Readers Circle", created_by: emmId,
    book_id: bookId("The Name of the Wind"),
  }).select("id").single();

  // Group chat: Mystery Club
  const { data: mysteryChat } = await supabase.from("conversations").insert({
    type: "group", name: "Mystery & Thriller Addicts", created_by: jamesId,
    book_id: bookId("Gone Girl"),
  }).select("id").single();

  // DM: Emma <-> James
  const { data: emmaJamesDM } = await supabase.from("conversations").insert({
    type: "dm", created_by: emmId,
  }).select("id").single();

  // DM: Sophia <-> Aisha
  const { data: sophiaAishaDM } = await supabase.from("conversations").insert({
    type: "dm", created_by: sophiaId,
  }).select("id").single();

  // Matched conversation (book match)
  const { data: bookMatchConv } = await supabase.from("conversations").insert({
    type: "matched", created_by: emmId, book_id: bookId("Dune"),
  }).select("id").single();

  const convIds = { fantasyChat, mysteryChat, emmaJamesDM, sophiaAishaDM, bookMatchConv };
  for (const [k, v] of Object.entries(convIds)) {
    ok(`Conversation: ${k}`, v ? null : { message: "null result" });
  }

  // ── 8. Conversation members ──────────────────────────────
  console.log("\n👥  Adding conversation members…");
  const convMemberRows = [
    // Fantasy group chat
    ...(fantasyChat ? [emmId, aishaId, jamesId, sophiaId].map((uid) => ({ conversation_id: fantasyChat.id, user_id: uid })) : []),
    // Mystery group chat
    ...(mysteryChat ? [jamesId, emmId, sophiaId, marcusId].map((uid) => ({ conversation_id: mysteryChat.id, user_id: uid })) : []),
    // Emma-James DM
    ...(emmaJamesDM ? [emmId, jamesId].map((uid) => ({ conversation_id: emmaJamesDM.id, user_id: uid })) : []),
    // Sophia-Aisha DM
    ...(sophiaAishaDM ? [sophiaId, aishaId].map((uid) => ({ conversation_id: sophiaAishaDM.id, user_id: uid })) : []),
    // Book match: Emma + Marcus (both read Dune)
    ...(bookMatchConv ? [emmId, marcusId].map((uid) => ({ conversation_id: bookMatchConv.id, user_id: uid })) : []),
  ];

  for (const row of convMemberRows) {
    const { error } = await supabase.from("conversation_members").upsert(row, { onConflict: "conversation_id,user_id" });
    if (error) console.error("  ❌ conv_member:", error.message);
  }
  console.log(`  ✅ ${convMemberRows.length} conversation members`);

  // ── 9. Messages ──────────────────────────────────────────
  console.log("\n✉️  Seeding messages…");

  async function insertMessages(conversationId, msgs) {
    if (!conversationId) return;
    for (const msg of msgs) {
      await supabase.from("messages").insert({ conversation_id: conversationId, ...msg });
      await new Promise((r) => setTimeout(r, 15)); // tiny delay to preserve ordering
    }
  }

  if (fantasyChat) {
    await insertMessages(fantasyChat.id, [
      { user_id: emmId,   content: "Hey everyone! Welcome to Fantasy Readers Circle 🎉 Excited to dive into The Name of the Wind together!", contains_spoiler: false },
      { user_id: aishaId, content: "SO excited! I've heard nothing but amazing things about this book. The magic system sounds incredible.", contains_spoiler: false },
      { user_id: jamesId, content: "I'll be honest — I normally don't do fantasy but Emma convinced me. Let's see what all the hype is about 😄", contains_spoiler: false },
      { user_id: emmId,   content: "Kvothe's backstory in the first few chapters absolutely hooked me. Patrick Rothfuss is a genius.", contains_spoiler: false },
      { user_id: sophiaId,content: "The prose is so beautiful! I'm highlighting every other sentence.", contains_spoiler: false },
      { user_id: aishaId, content: "⚠️ Spoiler about the sympathy magic system:", contains_spoiler: true },
      { user_id: emmId,   content: "The way the 'sympathy' magic has actual rules and costs makes it feel so real. No hand-wavy magic here!", contains_spoiler: false },
      { user_id: jamesId, content: "Okay I'm 80 pages in and I take it back — this is genuinely great. The frame narrative is clever.", contains_spoiler: false },
      { user_id: sophiaId,content: "Who's coming to the online meetup next Saturday? 🗓️", contains_spoiler: false },
      { user_id: emmId,   content: "I'll be there! Should we set a target chapter? Maybe up to Part 2?", contains_spoiler: false },
      { user_id: aishaId, content: "Part 2 works for me! That gives everyone about 200 pages.", contains_spoiler: false },
    ]);
    console.log("  ✅ Fantasy club messages");
  }

  if (mysteryChat) {
    await insertMessages(mysteryChat.id, [
      { user_id: jamesId, content: "Alright Mystery crew — Gone Girl first read or re-read for anyone?", contains_spoiler: false },
      { user_id: sophiaId,content: "First time! I've been avoiding spoilers like my life depends on it 😅", contains_spoiler: false },
      { user_id: emmId,   content: "Re-read for me. Knowing the twist makes the first half SO much more interesting.", contains_spoiler: false },
      { user_id: marcusId,content: "First time. 50 pages in and Amy's diary entries are already fascinating.", contains_spoiler: false },
      { user_id: jamesId, content: "The dual POV structure is Gillian Flynn's masterstroke. Nick's unreliability is so well-crafted.", contains_spoiler: false },
      { user_id: sophiaId,content: "I already don't trust either of them and I'm only on chapter 4 😂", contains_spoiler: false },
      { user_id: emmId,   content: "That's exactly how you're supposed to feel! Flynn is brilliant at making you question everything.", contains_spoiler: false },
      { user_id: marcusId,content: "The 'Cool Girl' monologue is already iconic and I haven't even reached it yet apparently.", contains_spoiler: false },
      { user_id: jamesId, content: "We should do a prediction round before anyone reads past Part 1 — who did it? 🔍", contains_spoiler: false },
      { user_id: sophiaId,content: "My money is on Nick. Everything about him feels off.", contains_spoiler: false },
      { user_id: emmId,   content: "Interesting choice... I'll say nothing 😶", contains_spoiler: false },
    ]);
    console.log("  ✅ Mystery club messages");
  }

  if (emmaJamesDM) {
    await insertMessages(emmaJamesDM.id, [
      { user_id: emmId,   content: "Hey James! Are you enjoying the Mystery club? I know it's a bit different from what you usually read 😄", contains_spoiler: false },
      { user_id: jamesId, content: "Honestly? Gone Girl is legitimately one of the best books I've read this year. The writing is razor sharp.", contains_spoiler: false },
      { user_id: emmId,   content: "Right?! I knew you'd come around. Have you read any other Gillian Flynn?", contains_spoiler: false },
      { user_id: jamesId, content: "Not yet but Sharp Objects is next on my list. Any recommendations for Fantasy I should try?", contains_spoiler: false },
      { user_id: emmId,   content: "If you liked the complex plotting of Gone Girl, try The Name of the Wind! Kvothe is just as unreliable a narrator as Nick.", contains_spoiler: false },
      { user_id: jamesId, content: "That's a great pitch. Added it to my Want to Read list 📚", contains_spoiler: false },
      { user_id: emmId,   content: "You won't regret it! See you at the Fantasy meetup Saturday?", contains_spoiler: false },
      { user_id: jamesId, content: "Wouldn't miss it. I actually have some questions about the magic system 😅", contains_spoiler: false },
    ]);
    console.log("  ✅ Emma-James DM messages");
  }

  if (sophiaAishaDM) {
    await insertMessages(sophiaAishaDM.id, [
      { user_id: sophiaId,content: "Aisha! Have you started A Court of Thorns and Roses yet?", contains_spoiler: false },
      { user_id: aishaId, content: "I'm literally halfway through it right now! Feyre is SO compelling. I can't put it down 😭", contains_spoiler: false },
      { user_id: sophiaId,content: "I knowww! I read it in two days. The world-building is gorgeous.", contains_spoiler: false },
      { user_id: aishaId, content: "Okay warning — I have thoughts about Tamlin that I need to process with someone", contains_spoiler: false },
      { user_id: sophiaId,content: "Oh I am HERE for this conversation. Tell me everything.", contains_spoiler: false },
      { user_id: aishaId, content: "His character is so layered! I can't decide if I love him or am frustrated by him.", contains_spoiler: false },
      { user_id: sophiaId,content: "That's exactly how you're supposed to feel! Wait until you get to the second book... 👀", contains_spoiler: false },
      { user_id: aishaId, content: "NO SPOILERS! I'm going in blind 😂 But yes finish quickly so we can talk properly", contains_spoiler: false },
      { user_id: sophiaId,content: "Haha okay okay. Come find me in the Lit Club chat when you're done!", contains_spoiler: false },
    ]);
    console.log("  ✅ Sophia-Aisha DM messages");
  }

  if (bookMatchConv) {
    await insertMessages(bookMatchConv.id, [
      { user_id: emmId,   content: "Hey Marcus! Looks like we both have Dune on our lists 🪐 Have you started it yet?", contains_spoiler: false },
      { user_id: marcusId,content: "Ha! Not yet — it's been sitting on my shelf for years. The sheer size intimidates me honestly.", contains_spoiler: false },
      { user_id: emmId,   content: "I actually finished it last month. Totally worth it! The political world-building feels so real — almost like the historical fiction you enjoy.", contains_spoiler: false },
      { user_id: marcusId,content: "That's a great point. The colonial/resource exploitation themes are very on-point for history too.", contains_spoiler: false },
      { user_id: emmId,   content: "Exactly! Herbert did massive amounts of research. Happy to be a reading buddy if you start it 😊", contains_spoiler: false },
      { user_id: marcusId,content: "That would be great! I'm finishing The Pillars of the Earth first — maybe two weeks?", contains_spoiler: false },
      { user_id: emmId,   content: "Perfect timing. I'll re-read with you 📖", contains_spoiler: false },
    ]);
    console.log("  ✅ Book match messages");
  }

  // ── 10. Club meetings ────────────────────────────────────
  console.log("\n🗓️  Creating club meetings…");
  const now = new Date();
  const meetingRows = [];

  if (fantasyClubId) {
    meetingRows.push({
      club_id: fantasyClubId, created_by: emmId,
      title: "The Name of the Wind — Part 1 Discussion",
      description: "We'll cover chapters 1–30. Come with your favourite quotes and predictions! Join via the Zoom link.",
      meeting_url: "https://zoom.us/j/fantasy-readers-circle",
      starts_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      ends_at:   new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
      status: "upcoming", book_id: bookId("The Name of the Wind"),
    });
  }

  if (mysteryClubId) {
    meetingRows.push({
      club_id: mysteryClubId, created_by: jamesId,
      title: "Gone Girl — Mid-Book Check-in",
      description: "Predictions! Who did it? Who do you trust? We want to hear your theories before the big reveal.",
      meeting_url: "https://zoom.us/j/mystery-addicts",
      starts_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at:   new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      status: "upcoming", book_id: bookId("Gone Girl"),
    });
  }

  if (litClubId) {
    meetingRows.push({
      club_id: litClubId, created_by: sophiaId,
      title: "Normal People — Full Book Discussion",
      description: "In-person meetup at our usual café! We're covering the full book — all feels welcome 💔",
      location: "The Literary Café, Queen St W, Toronto",
      starts_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at:   new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      status: "upcoming", book_id: bookId("Normal People"),
    });
    // Past meeting
    meetingRows.push({
      club_id: litClubId, created_by: sophiaId,
      title: "The Kite Runner — Opening Discussion",
      description: "Kick-off meeting for our Kite Runner read-along.",
      location: "The Literary Café, Toronto",
      starts_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at:   new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
      status: "past", book_id: bookId("The Kite Runner"),
    });
  }

  for (const row of meetingRows) {
    const { data: meeting, error } = await supabase.from("club_meetings").insert(row).select("id").single();
    if (ok(`Meeting: ${row.title.substring(0, 40)}`, error) && meeting) {
      // Add some RSVPs
      const rsvpUsers = row.status === "upcoming"
        ? [{ uid: row.created_by, s: "going" }, { uid: emmId, s: "going" }, { uid: aishaId, s: "maybe" }]
        : [];
      for (const r of rsvpUsers) {
        if (r.uid && r.uid !== row.created_by || rsvpUsers[0]?.uid === row.created_by) {
          await supabase.from("rsvps").upsert({ meeting_id: meeting.id, user_id: r.uid, status: r.s }, { onConflict: "meeting_id,user_id" });
        }
      }
    }
  }

  // ── 11. Polls ────────────────────────────────────────────
  console.log("\n🗳️  Creating polls…");
  if (fantasyClubId) {
    const { data: poll } = await supabase.from("polls").insert({
      club_id: fantasyClubId, created_by: emmId,
      question: "What should we read next after The Name of the Wind?",
      description: "Vote for the next book! We'll start reading in 3 weeks.",
      status: "active",
      closes_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).select("id").single();

    if (poll) {
      ok("Poll: Next book vote", null);
      const opts = [
        { poll_id: poll.id, label: "Mistborn: The Final Empire",  book_id: bookId("Mistborn: The Final Empire") },
        { poll_id: poll.id, label: "A Court of Thorns and Roses", book_id: bookId("A Court of Thorns and Roses") },
        { poll_id: poll.id, label: "Dune",                        book_id: bookId("Dune") },
      ];
      const { data: optRows } = await supabase.from("poll_options").insert(opts).select("id, label");
      if (optRows) {
        const votes = [
          { poll_id: poll.id, option_id: optRows[0].id, user_id: emmId },
          { poll_id: poll.id, option_id: optRows[1].id, user_id: aishaId },
          { poll_id: poll.id, option_id: optRows[2].id, user_id: jamesId },
          { poll_id: poll.id, option_id: optRows[0].id, user_id: sophiaId },
        ];
        for (const v of votes) {
          await supabase.from("poll_votes").upsert(v, { onConflict: "poll_id,user_id" });
        }
        console.log("  ✅ Poll options + votes added");
      }
    }
  }

  // ── Done ─────────────────────────────────────────────────
  console.log("\n🎉  Seed complete!\n");
  console.log("Demo accounts (password: BookTalk123!):");
  USERS.forEach((u) => console.log(`  • ${u.email}  — ${u.profile.name}`));
  console.log("\nVisit http://localhost:3001 and log in with any of the above.\n");
}

seed().catch((e) => { console.error("Fatal:", e); process.exit(1); });
