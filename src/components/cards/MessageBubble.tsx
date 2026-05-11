import React from "react";
import { Avatar } from "../ui/Avatar";

type MessageBubbleProps = {
  message: {
    id: string;
    userName: string;
    content: string;
    containsSpoiler: boolean;
    createdAt: string;
  };
  isOwn?: boolean;
  className?: string;
};

export function MessageBubble({ message, isOwn = false, className = "" }: MessageBubbleProps) {
  const [showSpoiler, setShowSpoiler] = React.useState(false);
  
  const messageDate = new Date(message.createdAt);
  const formattedTime = messageDate.toLocaleString("en-NZ", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} ${className}`}>
      <Avatar name={message.userName} size="sm" />
      <div className={`flex-1 max-w-2xl ${isOwn ? "items-end" : ""}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-sm text-slate-800">{message.userName}</span>
          <span className="text-xs text-slate-500">{formattedTime}</span>
        </div>
        <div
          className={`rounded-lg p-3 ${
            isOwn
              ? "bg-amber-100 text-slate-800"
              : "bg-white border border-stone-200 text-slate-700"
          }`}
        >
          {message.containsSpoiler && !showSpoiler ? (
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <span className="font-medium text-amber-800">Spoiler Alert</span>
              </div>
              <button
                onClick={() => setShowSpoiler(true)}
                className="text-amber-600 hover:text-amber-700 underline text-sm font-medium"
              >
                Click to reveal
              </button>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
