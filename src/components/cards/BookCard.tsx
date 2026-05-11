import React from "react";
import { Badge } from "../ui/Badge";

type BookCardProps = {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl?: string | null;
    genres: string[];
  };
  className?: string;
};

export function BookCard({ book, className = "" }: BookCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="aspect-[2/3] bg-slate-100 relative">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-4xl">📖</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-slate-600 mb-2">{book.author}</p>
        <div className="flex flex-wrap gap-1">
          {book.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="default">
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
