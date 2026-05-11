import React from "react";
import Link from "next/link";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

type ClubCardProps = {
  club: {
    id: string;
    name: string;
    description?: string | null;
    city?: string | null;
    country?: string | null;
    meetingType: string;
    privacy: string;
    memberCount: number;
    memberLimit: number;
    tags: string[];
    currentBook?: {
      title: string;
      author: string;
      coverUrl?: string | null;
    } | null;
    nextMeeting?: string;
  };
  className?: string;
};

export function ClubCard({ club, className = "" }: ClubCardProps) {
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

  return (
    <div className={`bg-white rounded-xl border border-stone-200 shadow-sm p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link href={`/clubs/${club.id}`}>
            <h3 className="font-bold text-lg text-slate-800 hover:text-amber-600 transition-colors">
              {club.name}
            </h3>
          </Link>
          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <span>{meetingTypeIcons[club.meetingType as keyof typeof meetingTypeIcons]}</span>
            <span>{club.city && club.country ? `${club.city}, ${club.country}` : "Location TBD"}</span>
          </p>
        </div>
        <Badge variant="default">{privacyLabels[club.privacy as keyof typeof privacyLabels]}</Badge>
      </div>

      {club.currentBook && (
        <div className="flex gap-3 mb-3 p-3 bg-amber-50 rounded-lg">
          <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
            {club.currentBook.coverUrl ? (
              <img
                src={club.currentBook.coverUrl}
                alt={club.currentBook.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                📚
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-amber-800 font-medium mb-0.5">Currently Reading</p>
            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{club.currentBook.title}</p>
            <p className="text-xs text-slate-600">{club.currentBook.author}</p>
          </div>
        </div>
      )}

      <p className="text-slate-700 text-sm mb-4 line-clamp-2">
        {club.description || "No description available."}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {club.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="primary">
            {tag}
          </Badge>
        ))}
        {club.tags.length > 3 && (
          <Badge variant="default">+{club.tags.length - 3}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <div className="text-sm text-slate-600">
          <span className="font-semibold">{club.memberCount}</span>
          <span>/{club.memberLimit} members</span>
        </div>
        <Link href={`/clubs/${club.id}`}>
          <Button size="sm" variant="primary">
            View Club
          </Button>
        </Link>
      </div>
    </div>
  );
}
