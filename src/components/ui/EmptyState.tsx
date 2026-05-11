import React from "react";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = "📚", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-600 mb-6 max-w-md">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
