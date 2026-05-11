// Mock data for BookCircle MVP
// This simulates database data for the demo

export const MOCK_USER = {
  id: "user_1",
  name: "Emma Wilson",
  email: "emma@example.com",
  city: "Auckland",
  country: "New Zealand",
  avatarUrl: null,
  favoriteGenres: ["Fantasy", "Romantasy", "Romance"],
  readingPace: "1-2 books/month",
  discussionStyle: "Casual",
  meetingPreference: "Hybrid",
  bio: "Book lover and fantasy enthusiast! Looking for fellow readers in Auckland.",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export const mockUsers = [
  MOCK_USER,
  {
    id: "user_2",
    name: "Sophia Chen",
    email: "sophia@example.com",
    city: "Auckland",
    country: "New Zealand",
    avatarUrl: null,
    favoriteGenres: ["Mystery", "Thriller"],
    readingPace: "2-3 books/month",
    discussionStyle: "Analytical",
    meetingPreference: "In-person",
    bio: "Mystery enthusiast who loves solving puzzles and discussing plot twists.",
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user_3",
    name: "James Parker",
    email: "james@example.com",
    city: "Auckland",
    country: "New Zealand",
    avatarUrl: null,
    favoriteGenres: ["Fantasy", "Sci-Fi"],
    readingPace: "1 book/month",
    discussionStyle: "Casual",
    meetingPreference: "Online",
    bio: "Fantasy and sci-fi reader. Love epic world-building!",
    createdAt: "2023-03-20T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user_4",
    name: "Olivia Taylor",
    email: "olivia@example.com",
    city: "Wellington",
    country: "New Zealand",
    avatarUrl: null,
    favoriteGenres: ["Romance", "Contemporary"],
    readingPace: "3-4 books/month",
    discussionStyle: "Casual",
    meetingPreference: "Hybrid",
    bio: "Romance reader who believes in happily ever afters.",
    createdAt: "2023-05-10T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user_5",
    name: "Liam Anderson",
    email: "liam@example.com",
    city: "Christchurch",
    country: "New Zealand",
    avatarUrl: null,
    favoriteGenres: ["Manga", "Graphic Novels"],
    readingPace: "2-3 books/month",
    discussionStyle: "Casual",
    meetingPreference: "Online",
    bio: "Manga and anime enthusiast. Always looking for new series to read!",
    createdAt: "2023-07-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const mockBooks = [
  {
    id: "book_1",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1701980900i/61431922.jpg",
    description: "Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant...",
    genres: ["Fantasy", "Romantasy", "Dragons"],
    tropes: ["Enemies to Lovers", "Found Family"],
    isbn: "9781649374042",
  },
  {
    id: "book_2",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1583524047i/46000520.jpg",
    description: "Four unlikely friends meet weekly in a retirement village to discuss unsolved murders...",
    genres: ["Mystery", "Cozy Mystery", "Thriller"],
    tropes: ["Found Family", "Unlikely Heroes"],
    isbn: "9780241425442",
  },
  {
    id: "book_3",
    title: "Book Lovers",
    author: "Emily Henry",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/58690308.jpg",
    description: "Nora Stephens' life is books—she's read them all...",
    genres: ["Romance", "Contemporary", "Rom-Com"],
    tropes: ["Enemies to Lovers", "Grumpy/Sunshine"],
    isbn: "9780593334836",
  },
  {
    id: "book_4",
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1619052725i/16096824.jpg",
    description: "Feyre's survival rests upon her ability to hunt and kill...",
    genres: ["Fantasy", "Romantasy", "Fae"],
    tropes: ["Beauty and the Beast", "Enemies to Lovers"],
    isbn: "9781619634449",
  },
  {
    id: "book_5",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    description: "The story of Mrs. Bennet's attempts to marry off her five daughters...",
    genres: ["Classic", "Romance", "Historical"],
    tropes: ["Enemies to Lovers", "Class Divide"],
    isbn: "9780141439518",
  },
  {
    id: "book_6",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582759969i/40097951.jpg",
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer...",
    genres: ["Thriller", "Mystery", "Psychological"],
    tropes: ["Unreliable Narrator", "Plot Twist"],
    isbn: "9781250301697",
  },
  {
    id: "book_7",
    title: "Spy x Family Vol. 1",
    author: "Tatsuya Endo",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1560077673i/45956334.jpg",
    description: "Master spy Twilight is unparalleled when it comes to going undercover on dangerous missions...",
    genres: ["Manga", "Comedy", "Action"],
    tropes: ["Found Family", "Secret Identity"],
    isbn: "9781974715657",
  },
  {
    id: "book_8",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1636978687i/58784475.jpg",
    description: "Two kids meet in a hospital gaming room in 1987...",
    genres: ["Literary Fiction", "Contemporary"],
    tropes: ["Friendship", "Coming of Age"],
    isbn: "9780593321201",
  },
  {
    id: "book_9",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1618359103i/32620332.jpg",
    description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life...",
    genres: ["Historical Fiction", "LGBTQ+", "Romance"],
    tropes: ["Secret Romance", "Hollywood"],
    isbn: "9781501161933",
  },
  {
    id: "book_10",
    title: "Daisy Jones & The Six",
    author: "Taylor Jenkins Reid",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1547068857i/40597810.jpg",
    description: "Everyone knows Daisy Jones & The Six, but nobody knows the reason behind their split...",
    genres: ["Historical Fiction", "Music", "Drama"],
    tropes: ["Rock Band", "Second Chance"],
    isbn: "9781524798628",
  },
];

export const mockClubs = [
  {
    id: "club_1",
    name: "Auckland Fantasy Fans",
    description: "For lovers of epic fantasy, dragons, and magic! We meet monthly to discuss our current read and share recommendations.",
    currentBookId: "book_1",
    hostId: "user_1",
    city: "Auckland",
    country: "New Zealand",
    meetingType: "HYBRID" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 20,
    memberCount: 12,
    tags: ["Fantasy", "Romantasy", "Dragons"],
    partnerName: "Unity Books Auckland",
    partnerType: "BOOKSTORE" as const,
    nextMeeting: "2024-06-15T18:00:00Z",
    rules: "Be respectful, no spoilers without warnings, and have fun!",
  },
  {
    id: "club_2",
    name: "Cozy Mystery Circle",
    description: "Love a good whodunnit? Join us for monthly discussions of cozy mysteries and thrillers!",
    currentBookId: "book_2",
    hostId: "user_2",
    city: "Auckland",
    country: "New Zealand",
    meetingType: "IN_PERSON" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 15,
    memberCount: 8,
    tags: ["Mystery", "Cozy Mystery", "Thriller"],
    partnerName: "Takapuna Library",
    partnerType: "LIBRARY" as const,
    nextMeeting: "2024-06-10T14:00:00Z",
    rules: null,
  },
  {
    id: "club_3",
    name: "Romance Readers United",
    description: "All things romance! From sweet to spicy, contemporary to historical. A safe space to swoon over our favorite love stories.",
    currentBookId: "book_3",
    hostId: "user_4",
    city: "Wellington",
    country: "New Zealand",
    meetingType: "ONLINE" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 25,
    memberCount: 18,
    tags: ["Romance", "Contemporary", "Rom-Com"],
    nextMeeting: "2024-06-12T19:00:00Z",
    rules: null,
  },
  {
    id: "club_4",
    name: "SJM Fan Club",
    description: "Dedicated to Sarah J. Maas and her incredible worlds! Currently reading ACOTAR series.",
    currentBookId: "book_4",
    hostId: "user_1",
    city: "Auckland",
    country: "New Zealand",
    meetingType: "HYBRID" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 30,
    memberCount: 24,
    tags: ["Fantasy", "Romantasy", "Sarah J. Maas"],
    nextMeeting: "2024-06-20T18:30:00Z",
    rules: null,
  },
  {
    id: "club_5",
    name: "Classic Literature Society",
    description: "Exploring timeless classics together. Currently reading Austen!",
    currentBookId: "book_5",
    hostId: "user_2",
    city: "Auckland",
    country: "New Zealand",
    meetingType: "IN_PERSON" as const,
    privacy: "REQUEST_TO_JOIN" as const,
    memberLimit: 12,
    memberCount: 10,
    tags: ["Classic", "Literature", "Jane Austen"],
    partnerName: "The Coffee Club",
    partnerType: "CAFE" as const,
    nextMeeting: "2024-06-08T15:00:00Z",
    rules: "This is a members-only club focused on deep literary analysis.",
  },
  {
    id: "club_6",
    name: "Thriller Junkies",
    description: "For those who love edge-of-your-seat psychological thrillers and plot twists!",
    currentBookId: "book_6",
    hostId: "user_2",
    city: "Auckland",
    country: "New Zealand",
    meetingType: "ONLINE" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 20,
    memberCount: 15,
    tags: ["Thriller", "Psychological", "Mystery"],
    nextMeeting: "2024-06-18T20:00:00Z",
    rules: null,
  },
  {
    id: "club_7",
    name: "Manga & Anime Book Club",
    description: "Discussing manga, light novels, and anime adaptations. All series welcome!",
    currentBookId: "book_7",
    hostId: "user_5",
    city: "Christchurch",
    country: "New Zealand",
    meetingType: "ONLINE" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 25,
    memberCount: 20,
    tags: ["Manga", "Anime", "Japanese"],
    nextMeeting: "2024-06-14T19:00:00Z",
    rules: null,
  },
  {
    id: "club_8",
    name: "Contemporary Fiction Readers",
    description: "Modern stories, real emotions. We read and discuss contemporary literary fiction.",
    currentBookId: "book_8",
    hostId: "user_3",
    city: "Auckland",
    country: "New Zealand",
    meetingType: "HYBRID" as const,
    privacy: "PUBLIC" as const,
    memberLimit: 15,
    memberCount: 11,
    tags: ["Contemporary", "Literary Fiction"],
    nextMeeting: "2024-06-16T17:30:00Z",
    rules: null,
  },
];

export const mockMessages = [
  {
    id: "msg_1",
    clubId: "club_1",
    userId: "user_1",
    userName: "Emma Wilson",
    content: "Just finished Fourth Wing and WOW! What did everyone think of the ending?",
    containsSpoiler: false,
    createdAt: "2024-05-10T10:30:00Z",
  },
  {
    id: "msg_2",
    clubId: "club_1",
    userId: "user_3",
    userName: "James Parker",
    content: "The dragon bonding scene was absolutely epic! Can't wait for the sequel.",
    containsSpoiler: false,
    createdAt: "2024-05-10T11:15:00Z",
  },
  {
    id: "msg_3",
    clubId: "club_1",
    userId: "user_2",
    userName: "Sophia Chen",
    content: "Warning: Spoiler ahead! I can't believe what happened to Liam at the end!",
    containsSpoiler: true,
    createdAt: "2024-05-10T12:00:00Z",
  },
  {
    id: "msg_4",
    clubId: "club_2",
    userId: "user_2",
    userName: "Sophia Chen",
    content: "Welcome everyone! So glad to have you all here. Who's ready to solve some murders?",
    containsSpoiler: false,
    createdAt: "2024-05-09T14:00:00Z",
  },
  {
    id: "msg_5",
    clubId: "club_3",
    userId: "user_4",
    userName: "Olivia Taylor",
    content: "Emily Henry never misses! Book Lovers is such a beautiful story about love and family.",
    containsSpoiler: false,
    createdAt: "2024-05-11T19:30:00Z",
  },
];

export const mockMeetings = [
  {
    id: "meeting_1",
    clubId: "club_1",
    title: "Fourth Wing Discussion & Pizza Night",
    description: "Let's discuss the first book in the Empyrean series! Pizza provided, BYO drinks.",
    meetingType: "IN_PERSON" as const,
    locationName: "Unity Books Auckland",
    address: "19 High Street, Auckland CBD",
    startsAt: "2024-06-15T18:00:00Z",
    endsAt: "2024-06-15T20:00:00Z",
    rsvpCount: 8,
  },
  {
    id: "meeting_2",
    clubId: "club_2",
    title: "Thursday Murder Club Monthly Meet",
    description: "Discussing chapters 1-15. Bring your theories!",
    meetingType: "IN_PERSON" as const,
    locationName: "Takapuna Library",
    address: "9 The Strand, Takapuna",
    startsAt: "2024-06-10T14:00:00Z",
    endsAt: "2024-06-10T16:00:00Z",
    rsvpCount: 6,
  },
  {
    id: "meeting_3",
    clubId: "club_3",
    title: "Book Lovers Virtual Discussion",
    description: "Join us online to discuss this summer romance! Zoom link will be shared before the meeting.",
    meetingType: "ONLINE" as const,
    onlineUrl: "https://zoom.us/j/example123",
    startsAt: "2024-06-12T19:00:00Z",
    endsAt: "2024-06-12T20:30:00Z",
    rsvpCount: 12,
  },
  {
    id: "meeting_4",
    clubId: "club_4",
    title: "ACOTAR Series Discussion",
    description: "Discussing book 1! Spoilers for ACOTAR only, no talk of later books please.",
    meetingType: "HYBRID" as const,
    locationName: "Cafe on K' Road",
    address: "267 Karangahape Road, Auckland",
    onlineUrl: "https://zoom.us/j/example456",
    startsAt: "2024-06-20T18:30:00Z",
    endsAt: "2024-06-20T20:30:00Z",
    rsvpCount: 15,
  },
  {
    id: "meeting_5",
    clubId: "club_7",
    title: "Spy x Family Vol 1-3 Discussion",
    description: "Online meet to discuss the first three volumes! Manga spoilers ahead.",
    meetingType: "ONLINE" as const,
    onlineUrl: "https://discord.gg/example",
    startsAt: "2024-06-14T19:00:00Z",
    endsAt: "2024-06-14T20:30:00Z",
    rsvpCount: 14,
  },
];

export const mockPolls = [
  {
    id: "poll_1",
    clubId: "club_1",
    title: "What should we read next?",
    description: "Vote for our July book!",
    status: "ACTIVE" as const,
    options: [
      { id: "opt_1", label: "Iron Flame", bookId: null, voteCount: 7 },
      { id: "opt_2", label: "House of Sky and Breath", bookId: null, voteCount: 5 },
      { id: "opt_3", label: "A Court of Mist and Fury", bookId: "book_4", voteCount: 3 },
    ],
  },
  {
    id: "poll_2",
    clubId: "club_3",
    title: "Meeting time preference",
    description: "What time works best for everyone?",
    status: "ACTIVE" as const,
    options: [
      { id: "opt_4", label: "7:00 PM weekdays", voteCount: 8 },
      { id: "opt_5", label: "2:00 PM weekends", voteCount: 6 },
      { id: "opt_6", label: "8:00 PM weekdays", voteCount: 4 },
    ],
  },
];

export const mockClubMembers: Record<string, { userId: string; role: string }[]> = {
  club_1: [
    { userId: "user_1", role: "HOST" },
    { userId: "user_3", role: "MEMBER" },
    { userId: "user_2", role: "MEMBER" },
  ],
  club_2: [
    { userId: "user_2", role: "HOST" },
    { userId: "user_1", role: "MEMBER" },
  ],
  club_3: [
    { userId: "user_4", role: "HOST" },
    { userId: "user_1", role: "MEMBER" },
  ],
  club_4: [
    { userId: "user_1", role: "HOST" },
    { userId: "user_3", role: "MEMBER" },
    { userId: "user_4", role: "MEMBER" },
  ],
  club_5: [
    { userId: "user_2", role: "HOST" },
  ],
  club_6: [
    { userId: "user_2", role: "HOST" },
    { userId: "user_3", role: "MEMBER" },
  ],
  club_7: [
    { userId: "user_5", role: "HOST" },
  ],
  club_8: [
    { userId: "user_3", role: "HOST" },
    { userId: "user_1", role: "MEMBER" },
  ],
};

export function getMembersByClub(clubId: string) {
  const members = mockClubMembers[clubId] || [];
  return members.map((m) => ({
    ...m,
    user: mockUsers.find((u) => u.id === m.userId),
  })).filter((m) => m.user !== undefined);
}

// Helper functions
export function getBookById(id: string) {
  return mockBooks.find((book) => book.id === id);
}

export function getClubById(id: string) {
  return mockClubs.find((club) => club.id === id);
}

export function getUserById(id: string) {
  return mockUsers.find((user) => user.id === id);
}

export function getClubsByUser(userId: string) {
  // For demo, user_1 is in clubs 1, 4, and 8
  if (userId === "user_1") {
    return mockClubs.filter((club) => 
      ["club_1", "club_4", "club_8"].includes(club.id)
    );
  }
  return [];
}

export function getMessagesByClub(clubId: string) {
  return mockMessages.filter((msg) => msg.clubId === clubId);
}

export function getMeetingsByClub(clubId: string) {
  return mockMeetings.filter((meeting) => meeting.clubId === clubId);
}

export function getPollsByClub(clubId: string) {
  return mockPolls.filter((poll) => poll.clubId === clubId);
}
