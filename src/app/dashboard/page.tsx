import Link from "next/link";
import { ClubCard } from "@/components/cards/ClubCard";
import { MeetingCard } from "@/components/cards/MeetingCard";
import { Button } from "@/components/ui/Button";
import { MOCK_USER, mockClubs, mockBooks, mockMeetings, getClubsByUser } from "@/lib/mock-data";

export default function DashboardPage() {
  const userClubs = getClubsByUser(MOCK_USER.id).map((club) => ({
    ...club,
    currentBook: club.currentBookId
      ? mockBooks.find((b) => b.id === club.currentBookId) || null
      : null,
  }));

  const upcomingMeetings = mockMeetings
    .filter((m) => new Date(m.startsAt) > new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3);

  const recommendedClubs = mockClubs
    .filter((club) => !userClubs.some((uc) => uc.id === club.id))
    .filter((club) =>
      club.tags.some((tag) => MOCK_USER.favoriteGenres.includes(tag))
    )
    .slice(0, 3)
    .map((club) => ({
      ...club,
      currentBook: club.currentBookId
        ? mockBooks.find((b) => b.id === club.currentBookId) || null
        : null,
    }));

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Welcome back, {MOCK_USER.name}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Here's what's happening in your book clubs
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-slate-800">{userClubs.length}</div>
            <div className="text-sm text-slate-600">My Clubs</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-slate-800">{upcomingMeetings.length}</div>
            <div className="text-sm text-slate-600">Upcoming Meetings</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-2xl font-bold text-slate-800">{userClubs.length}</div>
            <div className="text-sm text-slate-600">Currently Reading</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-2xl font-bold text-slate-800">5</div>
            <div className="text-sm text-slate-600">New Messages</div>
          </div>
        </div>

        {/* My Clubs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">My Clubs</h2>
            <Link href="/clubs/create">
              <Button variant="primary" size="sm">
                + Create Club
              </Button>
            </Link>
          </div>
          {userClubs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {userClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No clubs yet
              </h3>
              <p className="text-slate-600 mb-6">
                Join a club to start connecting with fellow readers!
              </p>
              <Link href="/explore">
                <Button variant="primary">Explore Clubs</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming Meetings */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Upcoming Meetings</h2>
          {upcomingMeetings.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <p className="text-slate-600">No upcoming meetings</p>
            </div>
          )}
        </section>

        {/* Recommended Clubs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Recommended for You</h2>
            <Link href="/explore">
              <Button variant="ghost" size="sm">
                See All →
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendedClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
