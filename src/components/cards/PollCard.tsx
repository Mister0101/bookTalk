import React from "react";
import { Button } from "../ui/Button";

type PollCardProps = {
  poll: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    options: {
      id: string;
      label: string;
      voteCount: number;
    }[];
  };
  onVote?: (optionId: string) => void;
  userVote?: string | null;
  className?: string;
};

export function PollCard({ poll, onVote, userVote, className = "" }: PollCardProps) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
  const winningCount = Math.max(...poll.options.map((opt) => opt.voteCount));

  return (
    <div className={`bg-white rounded-xl border border-stone-200 shadow-sm p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-bold text-lg text-slate-800 mb-1">{poll.title}</h3>
        {poll.description && (
          <p className="text-slate-600 text-sm">{poll.description}</p>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
          const isWinning = option.voteCount === winningCount && winningCount > 0;
          const isUserVote = userVote === option.id;

          return (
            <div key={option.id} className="relative">
              <div
                className={`absolute inset-0 rounded-lg ${
                  isWinning ? "bg-amber-100" : "bg-slate-100"
                } transition-all`}
                style={{ width: `${percentage}%` }}
              />
              <div
                className={`relative flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  poll.status === "ACTIVE"
                    ? `cursor-pointer hover:border-amber-500 ${isUserVote ? "border-amber-500" : "border-slate-200"}`
                    : "cursor-not-allowed opacity-75 border-slate-200"
                }`}
                onClick={() => onVote && poll.status === "ACTIVE" && onVote(option.id)}
              >
                <div className="flex items-center gap-2">
                  {isWinning && <span className="text-lg">🏆</span>}
                  <span className="font-medium text-slate-800">{option.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {option.voteCount} {option.voteCount === 1 ? "vote" : "votes"}
                  </span>
                  <span className="text-sm font-semibold text-amber-600">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-200">
        <div className="text-sm text-slate-600">
          <span className="font-semibold">{totalVotes}</span> total votes
        </div>
        {poll.status === "ACTIVE" && (
          <span className="text-xs text-green-600 font-medium">● Active</span>
        )}
        {poll.status === "CLOSED" && (
          <span className="text-xs text-slate-500 font-medium">Closed</span>
        )}
      </div>
    </div>
  );
}
