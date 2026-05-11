# BookCircle - Local-First Book Club Platform 📚

A complete Next.js MVP for connecting book lovers, discovering clubs, and building reading communities.

## 🎉 Project Status: Successfully Built & Deployed

**Build Status:** ✅ All 10 pages compile successfully  
**TypeScript:** ✅ Type-safe with zero errors  
**Components:** 17 reusable components  
**Pages:** 10 fully functional pages  

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js ready (mock auth for demo)
- **Deployment:** Vercel-ready

## 🎨 Features

### For Users
- 🔍 **Discover Clubs** - Search and filter by genre, location, meeting type
- 📖 **Join Discussions** - Participate in book discussions with spoiler protection
- 📅 **Attend Meetings** - RSVP to in-person, online, or hybrid meetings
- 🗳️ **Vote in Polls** - Help choose the next book to read
- 👥 **Build Community** - Connect with local readers who share your interests
- 🛡️ **Safety First** - Guidelines and notices for in-person meetings

### For Hosts
- ➕ **Create Clubs** - Start your own book club with custom settings
- 🔒 **Privacy Controls** - Public, request-to-join, or invite-only options
- 📊 **Manage Members** - Host, moderator, and member roles
- 📣 **Organize Meetings** - Schedule and manage club gatherings
- 🤝 **Partner Integration** - Connect with local bookstores, libraries, cafes

## 📂 Project Structure

```
bookTalk/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── explore/           # Browse clubs
│   │   ├── clubs/
│   │   │   ├── [id]/          # Dynamic club detail
│   │   │   └── create/        # Create club form
│   │   ├── dashboard/         # User dashboard
│   │   ├── login/             # Login page
│   │   ├── signup/            # Registration
│   │   ├── onboarding/        # User onboarding flow
│   │   ├── profile/[id]/      # User profiles
│   │   └── settings/          # Account settings
│   ├── components/
│   │   ├── cards/             # BookCard, ClubCard, MeetingCard, PollCard, MessageBubble
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # Button, Input, Badge, Avatar, etc.
│   └── lib/
│       └── mock-data.ts       # Demo data (20 books, 8 clubs, 5 users)
├── prisma/
│   └── schema.prisma          # Database schema (11 models)
└── public/                     # Static assets
```

## 🗄️ Database Schema

Complete Prisma schema with 11 models:
- **User** - Authentication & preferences
- **Book** - Book metadata & genres
- **Club** - Club details & settings
- **ClubMember** - Membership with roles
- **Message** - Discussion threads
- **Poll/PollOption/PollVote** - Voting system
- **Meeting/RSVP** - Event management
- **JoinRequest** - Membership requests
- **Report** - Safety & moderation

## 🎯 Pages Overview

### Public Pages
- **/** - Hero section, features, featured clubs, safety info
- **/explore** - Search clubs with filters (genre, location, type)
- **/clubs/[id]** - Club detail with tabs (Overview, Discussion, Members, Polls, Meetings)
- **/login** - Email/password login
- **/signup** - New user registration

### Authenticated Pages
- **/dashboard** - Personalized dashboard with stats and recommendations
- **/onboarding** - 3-step profile setup (location, genres, preferences)
- **/clubs/create** - Create club with full customization
- **/profile/[id]** - User profile with clubs and preferences
- **/settings** - Account settings and notifications

## 🎨 Design System

**Color Palette:**
- Primary: Amber-600 (#d97706) - Warm, inviting book theme
- Background: Stone-50 (#fafaf9) - Soft, readable cream
- Text: Slate-800 (headings), Slate-600 (body)

**Components:**
- Cards: White with rounded-xl, subtle shadows
- Buttons: 3 variants (primary, secondary, ghost)
- Badges: Genre tags with color coding
- Responsive: Mobile-first, fully responsive

## 📊 Mock Data

The app includes realistic demo data:
- **20 Books**: Fourth Wing, ACOTAR, The Thursday Murder Club, Book Lovers, Pride & Prejudice, The Silent Patient, Spy x Family, and more
- **8 Book Clubs**: Fantasy, Mystery, Romance, Manga, Classic Literature
- **5 Users**: With diverse reading preferences
- **30 Messages**: Across club discussions
- **5 Meetings**: In-person, online, and hybrid
- **4 Active Polls**: For next book selection

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (for production)

### Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bookcircle"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Setup
1. Add PostgreSQL database (Vercel Postgres, Supabase, etc.)
2. Set environment variables in Vercel dashboard
3. Run `npx prisma db push` to create tables
4. Deploy!

## 🔮 Future Enhancements

- [ ] Real authentication with OAuth providers
- [ ] Real-time messaging with WebSockets
- [ ] Email notifications for meetings/messages
- [ ] Image upload for avatars and book covers
- [ ] Advanced search with Algolia
- [ ] Book API integration (Google Books, Open Library)
- [ ] Reading progress tracking
- [ ] Book recommendations engine
- [ ] Mobile app (React Native)

## 📄 License

MIT

## 🙏 Acknowledgments

Built with love for book lovers everywhere! 📚❤️

---

**Made with:** Next.js 14 • TypeScript • Tailwind CSS • Prisma • NextAuth.js
