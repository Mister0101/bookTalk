import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

type MeetingCardProps = {
  meeting: {
    id: string;
    title: string;
    description?: string | null;
    meetingType: string;
    locationName?: string | null;
    address?: string | null;
    onlineUrl?: string | null;
    startsAt: string;
    endsAt?: string | null;
    rsvpCount: number;
  };
  showRSVP?: boolean;
  className?: string;
};

export function MeetingCard({ meeting, showRSVP = true, className = "" }: MeetingCardProps) {
  const meetingDate = new Date(meeting.startsAt);
  const formattedDate = meetingDate.toLocaleDateString("en-NZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = meetingDate.toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const meetingTypeIcons = {
    IN_PERSON: "📍",
    ONLINE: "💻",
    HYBRID: "🌐",
  };

  return (
    <div className={`bg-white rounded-xl border border-stone-200 shadow-sm p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-800 mb-1">{meeting.title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{meetingTypeIcons[meeting.meetingType as keyof typeof meetingTypeIcons]}</span>
            <Badge variant="default">{meeting.meetingType.replace("_", " ")}</Badge>
          </div>
        </div>
      </div>

      {meeting.description && (
        <p className="text-slate-700 text-sm mb-3">{meeting.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">📅</span>
          <span className="text-slate-700">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">🕐</span>
          <span className="text-slate-700">{formattedTime}</span>
        </div>
        {meeting.locationName && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">📍</span>
            <div>
              <span className="text-slate-700 font-medium">{meeting.locationName}</span>
              {meeting.address && (
                <span className="text-slate-600 block text-xs">{meeting.address}</span>
              )}
            </div>
          </div>
        )}
        {meeting.onlineUrl && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">🔗</span>
            <span className="text-slate-700">Online meeting link available</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <div className="text-sm text-slate-600">
          <span className="font-semibold">{meeting.rsvpCount}</span> attending
        </div>
        {showRSVP && (
          <div className="flex gap-2">
            <Button size="sm" variant="primary">
              Going
            </Button>
            <Button size="sm" variant="ghost">
              Maybe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
