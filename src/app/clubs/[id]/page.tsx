"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { MessageBubble } from "@/components/cards/MessageBubble";
import { MeetingCard } from "@/components/cards/MeetingCard";
import { PollCard } from "@/components/cards/PollCard";
import { SafetyNotice } from "@/components/ui/SafetyNotice";
import { getClubById, getBookById, getUserById, getMessagesByClub, getMeetingsByClub, getPollsByClub, getMembersByClub, MOCK_USER } from "@/lib/mock-data";

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;
  const [activeTab, setActiveTab] = React.useState("overview");

  const club = getClubById(clubId);
  const currentBook = club?.currentBookId ? getBookById(club.currentBookId) : null;
  const host = club ? getUserById(club.hostId) : null;
  const messages = getMessagesByClub(clubId);
  const meetings = getMeetingsByClub(clubId);
  const polls = getPollsByClub(clubId);
  const clubMembers = getMembersByClub(clubId);

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Club not found</h2>
          <Link href="/explore">
            <Button variant="primary">Explore Clubs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const meetingTypeIcons = {
    IN_PERSON: "📍",
    ONLINE: "💻",
    HYBRID: "🌐",
  };

  const privacyLabels = {
    PUBLIC: "Public",
    REQUEST_TO_JOIN: "Request to Join",
    INVITE_ONLY: "Invite Only",
  };

  const isMember = true; // For demo, assume user is a member

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-100 to-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Book Cover */}
            {currentBook && (
              <div className="w-full md:w-48 h-72 bg-white rounded-lg shadow-lg overflow-hidden flex-shrink-0">
                {currentBook.coverUrl ? (
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-6xl">📖</span>
                  </div>
                )}
              </div>
            )}

            {/* Club Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">{club.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>{meetingTypeIcons[club.meetingType as keyof typeof meetingTypeIcons]}</span>
                      <span>{club.city && club.country ? `${club.city}, ${club.country}` : "Location TBD"}</span>
                    </span>
                    <span>•</span>
                    <Badge variant="default">{privacyLabels[club.privacy as keyof typeof privacyLabels]}</Badge>
                    <span>•</span>
                    <span>{club.memberCount}/{club.memberLimit} members</span>
                  </div>
                </div>
                {!isMember && (
                  <Button variant="primary" size="lg">
                    Join Club
                  </Button>
                )}
              </div>

              {currentBook && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-stone-200">
                  <p className="text-sm text-amber-800 font-medium mb-1">Currently Reading</p>
                  <h3 className="text-xl font-bold text-slate-800">{currentBook.title}</h3>
                  <p className="text-slate-600">by {currentBook.author}</p>
                </div>
              )}

              <p className="text-slate-700 mb-4">{club.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {club.tags.map((tag) => (
                  <Badge key={tag} variant="primary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {host && (
                <div className="flex items-center gap-3">
                  <Avatar name={host.name} size="sm" />
                  <div>
                    <p className="text-sm text-slate-600">Hosted by</p>
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
            {["overview", "discussion", "members", "polls", "meetings"].map((tab) => (
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
        {activeTab === "overview" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">About This Club</h2>
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <p className="text-slate-700 mb-4">{club.description}</p>
                {club.rules && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Club Rules</h3>
                    <p className="text-slate-700">{club.rules}</p>
                  </div>
                )}
              </div>
            </section>

            {club.meetingType !== "ONLINE" && <SafetyNotice />}

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Upcoming Meetings</h2>
              {meetings.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {meetings.slice(0, 2).map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} showRSVP={isMember} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
                  <p className="text-slate-600">No upcoming meetings scheduled</p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "discussion" && (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Discussion</h2>
            {isMember ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.userId === MOCK_USER.id}
                  />
                ))}
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <textarea
                    placeholder="Type your message..."
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" />
                      <span>Contains spoilers</span>
                    </label>
                    <Button size="sm" variant="primary">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Members Only
                </h3>
                <p className="text-slate-600 mb-6">
                  Join this club to participate in discussions
                </p>
                <Button variant="primary">Join Club</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Members ({club.memberCount})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubMembers.map((member) => (
                <div
                  key={member.userId}
                  className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3"
                >
                  <Avatar name={member.user!.name} size="md" />
                  <div>
                    <p className="font-medium text-slate-800">{member.user!.name}</p>
                    <p className="text-sm text-slate-600">
                      {member.role === "HOST" ? "Host" : member.role === "MODERATOR" ? "Moderator" : "Member"}
                    </p>
                    {member.user!.city && (
                      <p className="text-xs text-slate-500">{member.user!.city}</p>
                    )}
                  </div>
                </div>
              ))}
              {clubMembers.length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-600">
                  No member data available
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "polls" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Polls</h2>
            {polls.length > 0 ? (
              <div className="space-y-6 max-w-2xl">
                {polls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No polls yet</h3>
                <p className="text-slate-600">Check back later for club polls</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "meetings" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Meetings</h2>
            {club.meetingType !== "ONLINE" && <SafetyNotice className="mb-6" />}
            {meetings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {meetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} showRSVP={isMember} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  No meetings scheduled
                </h3>
                <p className="text-slate-600">Check back later for meeting announcements</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
