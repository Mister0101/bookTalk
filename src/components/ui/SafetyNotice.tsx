import React from "react";

type SafetyNoticeProps = {
  className?: string;
};

export function SafetyNotice({ className = "" }: SafetyNoticeProps) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <h4 className="font-semibold text-amber-900 mb-1">Safety First</h4>
          <p className="text-sm text-amber-800">
            When meeting in person, always choose public spaces and let someone know where you'll be. 
            Trust your instincts and prioritize your safety.
          </p>
        </div>
      </div>
    </div>
  );
}
