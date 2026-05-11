"use client";

import React from "react";
import { ClubCard } from "@/components/cards/ClubCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { mockClubs, mockBooks } from "@/lib/mock-data";

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [meetingType, setMeetingType] = React.useState("");
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState("recommended");

  const allGenres = Array.from(
    new Set(mockBooks.flatMap((book) => book.genres))
  ).sort();

  const clubs = mockClubs.map((club) => ({
    ...club,
    currentBook: club.currentBookId
      ? mockBooks.find((b) => b.id === club.currentBookId) || null
      : null,
  }));

  const filteredClubs = clubs
    .filter((club) => {
      const matchesSearch =
        !searchTerm ||
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMeetingType =
        !meetingType || club.meetingType === meetingType;

      const matchesGenre =
        selectedGenres.length === 0 ||
        selectedGenres.some((genre) => club.tags.includes(genre));

      return matchesSearch && matchesMeetingType && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.memberCount - a.memberCount; // fallback since no createdAt on mock clubs
      }
      if (sortBy === "most-members") {
        return b.memberCount - a.memberCount;
      }
      if (sortBy === "next-meeting") {
        const aNext = a.nextMeeting ? new Date(a.nextMeeting).getTime() : Infinity;
        const bNext = b.nextMeeting ? new Date(b.nextMeeting).getTime() : Infinity;
        return aNext - bNext;
      }
      // "recommended" - by member count then recency
      return b.memberCount - a.memberCount;
    });

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Explore Book Clubs</h1>
          <p className="text-lg text-slate-600">
            Find your perfect reading community from {mockClubs.length} active clubs
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Search"
              placeholder="Search clubs by name or book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Meeting Type"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              options={[
                { value: "", label: "All Types" },
                { value: "IN_PERSON", label: "In Person" },
                { value: "ONLINE", label: "Online" },
                { value: "HYBRID", label: "Hybrid" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Genre
            </label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre)
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {(searchTerm || meetingType || selectedGenres.length > 0) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-slate-600">Active filters:</span>
              {selectedGenres.map((genre) => (
                <Badge key={genre} variant="primary">
                  {genre}
                  <button
                    onClick={() => toggleGenre(genre)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setMeetingType("");
                  setSelectedGenres([]);
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-600">
            <span className="font-semibold">{filteredClubs.length}</span> clubs found
          </p>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: "recommended", label: "Recommended" },
              { value: "newest", label: "Newest First" },
              { value: "most-members", label: "Most Members" },
              { value: "next-meeting", label: "Next Meeting Soon" },
            ]}
          />
        </div>

        {filteredClubs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No clubs found</h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchTerm("");
                setMeetingType("");
                setSelectedGenres([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
