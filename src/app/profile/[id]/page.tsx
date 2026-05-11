"use client";

import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ClubCard } from "@/components/cards/ClubCard";
import { getUserById, getClubsByUser, mockBooks } from "@/lib/mock-data";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const user = getUserById(userId);
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-slate-800">User not found</h2>
        </div>
      </div>
    );
  }

  const userClubs = getClubsByUser(userId).map((club) => ({
    ...club,
    currentBook: club.currentBookId
      ? mockBooks.find((b) => b.id === club.currentBookId) || null
      : null,
  }));

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-stone-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.name}</h1>
              <p className="text-slate-600 mb-4">
                {user.city && user.country && `📍 ${user.city}, ${user.country}`}
              </p>
              
              {user.bio && (
                <p className="text-slate-700 mb-4">{user.bio}</p>
              )}

              {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">Favorite Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteGenres.map((genre) => (
                      <Badge key={genre} variant="primary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {user.readingPace && (
                  <div>
                    <p className="text-sm text-slate-600">Reading Pace</p>
                    <p className="font-medium text-slate-800">{user.readingPace}</p>
                  </div>
                )}
                {user.discussionStyle && (
                  <div>
                    <p className="text-sm text-slate-600">Discussion Style</p>
                    <p className="font-medium text-slate-800">{user.discussionStyle}</p>
                  </div>
                )}
                {user.meetingPreference && (
                  <div>
                    <p className="text-sm text-slate-600">Meeting Preference</p>
                    <p className="font-medium text-slate-800">{user.meetingPreference}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600">Member Since</p>
                  <p className="font-medium text-slate-800">
                    {new Date(user.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Button variant="secondary">Edit Profile</Button>
            </div>
          </div>
        </div>

        {/* User's Clubs */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Clubs ({userClubs.length})
          </h2>
          {userClubs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No clubs yet</h3>
              <p className="text-slate-600">This user hasn't joined any clubs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
