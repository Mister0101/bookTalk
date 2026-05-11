import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ClubCard } from "@/components/cards/ClubCard";
import { mockClubs, mockBooks } from "@/lib/mock-data";

export default function HomePage() {
  const featuredClubs = mockClubs.slice(0, 3).map((club) => ({
    ...club,
    currentBook: club.currentBookId
      ? mockBooks.find((b) => b.id === club.currentBookId) || null
      : null,
  }));

  return (
    <div className="bg-stone-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Find Your Perfect <span className="text-amber-600">Book Club</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Connect with local readers, discover amazing books, and build lasting friendships through shared stories.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/explore">
                <Button size="lg" variant="primary">
                  Explore Clubs
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            How BookCircle Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Discover Clubs
              </h3>
              <p className="text-slate-600">
                Browse book clubs in your area or online. Filter by genre, meeting type, and preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Join & Connect
              </h3>
              <p className="text-slate-600">
                Join clubs that match your interests. Meet fellow book lovers and start meaningful discussions.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Read Together
              </h3>
              <p className="text-slate-600">
                Participate in discussions, attend meetings, and share your love for books with your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Featured Clubs</h2>
            <Link href="/explore">
              <Button variant="ghost">View All →</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* Why BookCircle */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Why Choose BookCircle?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold text-slate-800 mb-2">Local & Online</h3>
              <p className="text-sm text-slate-600">
                Find clubs meeting in person, online, or both. Your choice!
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-slate-800 mb-2">Personalized Matches</h3>
              <p className="text-sm text-slate-600">
                Get club recommendations based on your reading preferences.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-slate-800 mb-2">Community First</h3>
              <p className="text-sm text-slate-600">
                Built by readers, for readers. Join a welcoming community.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <div className="text-3xl mb-3">🆓</div>
              <h3 className="font-semibold text-slate-800 mb-2">100% Free</h3>
              <p className="text-sm text-slate-600">
                No hidden fees. Create and join clubs at no cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Your Safety Matters
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                BookCircle is committed to providing a safe environment for all members. 
                We encourage meeting in public places and have community guidelines to ensure 
                everyone has a positive experience.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-medium text-slate-700">Public Meetings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-medium text-slate-700">Community Guidelines</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-medium text-slate-700">Report System</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Your Book Community?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Sign up today and discover your next favorite book club.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
