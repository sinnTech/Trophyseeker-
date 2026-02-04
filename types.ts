

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: string;
}

// Simplified User interface for friend lists
export interface FriendUser {
  id: string;
  username: string;
}

export enum FriendRequestStatus {
  pending = 'pending',
  accepted = 'accepted',
  declined = 'declined',
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  status: FriendRequestStatus;
  timestamp: number;
}

export interface GameTrophyCounts {
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
}

export interface SimulatedUserStats {
  tipsCount: number;
  goalsCompleted: number;
  goalsTotal: number;
  badgesEarned: number;
  gameTrophyCounts?: { [gameId: string]: GameTrophyCounts }; // New field for game-specific trophies
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  badgeId: string; // ID of the badge awarded for completing this challenge
  trophyGoalExample?: string; // An example of what a user might need to do to complete it
}

export interface UserChallenge extends Challenge {
  isCompleted: boolean;
  isClaimed: boolean; // True if badge has been claimed
  completedTimestamp?: number;
  weekId: string; // To indicate which "week" this challenge belongs to
}

export interface User {
  id: string;
  username: string;
  friendRequestsSent?: FriendRequest[];
  friendRequestsReceived?: FriendRequest[];
  friendsList?: FriendUser[];
  earnedBadges?: Badge[]; // New field for explicitly storing earned badges
  activeChallenges?: UserChallenge[]; // New field for active challenges for the current week
  gameTrophyCounts?: { [gameId: string]: GameTrophyCounts }; // New: For the logged-in user's trophies
  isPsnConnected?: boolean; // NEW: Track if PSN is "connected"
}

export interface TrophyTip {
  id: string;
  userId: string;
  username: string;
  tip: string;
  timestamp: number;
}

export interface Game {
  id: string;
  name: string;
}

export interface Video {
  id: string;
  title: string;
  gameId: string;
  embedUrl: string; // YouTube embed URL
  uploader?: string; // For simulated community uploads
  timestamp?: number;
}

export interface TrophyGoal {
  id: string;
  userId: string;
  username: string;
  goal: string;
  isCompleted: boolean;
  timestamp: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // Emoji or simple icon string
  description: string;
}

// Interface to represent a dummy friend user along with their simulated stats
export interface DummyFriend {
  user: FriendUser;
  stats: SimulatedUserStats;
}