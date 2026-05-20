export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ReadingStatus = 'reading' | 'planned' | 'finished'
export type ConversationType = 'dm' | 'group' | 'matched'
export type ClubPrivacy = 'public' | 'request_to_join' | 'invite_only'
export type MeetingType = 'in_person' | 'online' | 'hybrid'
export type MemberRole = 'host' | 'co_host' | 'member'
export type MemberStatus = 'active' | 'pending' | 'banned'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          favorite_genres: string[]
          reading_pace: string | null
          discussion_style: string | null
          meeting_preference: string | null
          allow_group_matching: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          favorite_genres?: string[]
          reading_pace?: string | null
          discussion_style?: string | null
          meeting_preference?: string | null
          allow_group_matching?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          favorite_genres?: string[]
          reading_pace?: string | null
          discussion_style?: string | null
          meeting_preference?: string | null
          allow_group_matching?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          cover_url: string | null
          genres: string[]
          description: string | null
          isbn: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          cover_url?: string | null
          genres?: string[]
          description?: string | null
          isbn?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          cover_url?: string | null
          genres?: string[]
          description?: string | null
          isbn?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_books: {
        Row: {
          id: string
          user_id: string
          book_id: string
          status: ReadingStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          status: ReadingStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          status?: ReadingStatus
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          type: ConversationType
          name: string | null
          book_id: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          type: ConversationType
          name?: string | null
          book_id?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: ConversationType
          name?: string | null
          book_id?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          content: string
          contains_spoiler: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          content: string
          contains_spoiler?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          content?: string
          contains_spoiler?: boolean
          created_at?: string
        }
        Relationships: []
      }
      match_queue: {
        Row: {
          id: string
          user_id: string
          book_id: string
          queued_at: string
          matched: boolean
          conversation_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          queued_at?: string
          matched?: boolean
          conversation_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          queued_at?: string
          matched?: boolean
          conversation_id?: string | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string | null
          book_id: string | null
          genre: string | null
          created_by: string
          privacy: ClubPrivacy
          meeting_type: MeetingType
          city: string | null
          country: string | null
          rules: string | null
          member_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          book_id?: string | null
          genre?: string | null
          created_by: string
          privacy?: ClubPrivacy
          meeting_type?: MeetingType
          city?: string | null
          country?: string | null
          rules?: string | null
          member_limit?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          book_id?: string | null
          genre?: string | null
          created_by?: string
          privacy?: ClubPrivacy
          meeting_type?: MeetingType
          city?: string | null
          country?: string | null
          rules?: string | null
          member_limit?: number | null
          created_at?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          id: string
          club_id: string
          user_id: string
          role: MemberRole
          status: MemberStatus
          joined_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          role?: MemberRole
          status?: MemberStatus
          joined_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          role?: MemberRole
          status?: MemberStatus
          joined_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      reading_status: ReadingStatus
      conversation_type: ConversationType
      club_privacy: ClubPrivacy
      meeting_type: MeetingType
      member_role: MemberRole
      member_status: MemberStatus
    }
    CompositeTypes: Record<string, never>
  }
}
