// Player Types
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PlayerPosition = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type FoodPreference = 'VEGETARIAN' | 'NON_VEGETARIAN';

export interface Player {
  id: string;
  traineeId: string;
  fullName: string;
  gender: Gender;
  contactNumber: string;
  emergencyContact?: string;
  email?: string;
  department: string;
  position: PlayerPosition;
  battingStyle?: string;
  bowlingStyle?: string;
  experienceLevel: ExperienceLevel;
  attended: boolean;
  attendedAt?: Date;
  qrCode: string;
  foodPreference: FoodPreference;
  foodCollected: boolean;
  foodCollectedAt?: Date;
  teamId?: string;
  team?: Team;
  createdAt: Date;
  updatedAt: Date;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  color: string;
  captainId?: string;
  viceCaptainId?: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

// Match Types
export type MatchType = 'T10' | 'T15' | 'T20';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'RAIN_DELAY';
export type TossDecision = 'BAT' | 'BOWL';

export interface Match {
  id: string;
  matchNumber: number;
  matchType: MatchType;
  homeTeamId: string;
  homeTeam: Team;
  awayTeamId: string;
  awayTeam: Team;
  status: MatchStatus;
  scheduledTime: Date;
  actualStartTime?: Date;
  endTime?: Date;
  venue: string;
  overs: number;
  homeScore?: string;
  awayScore?: string;
  winnerId?: string;
  result?: string;
  tossWinnerId?: string;
  tossDecision?: TossDecision;
  umpire1?: string;
  umpire2?: string;
  scorer?: string;
  manOfTheMatchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Commentary Types
export type CommentaryType = 
  | 'WICKET' | 'BOUNDARY' | 'FOUR' | 'SIX' | 'DOT' 
  | 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'WIDE' | 'NO_BALL' 
  | 'BYE' | 'LEG_BYE' | 'MILESTONE' | 'GENERAL';

export interface Commentary {
  id: string;
  matchId: string;
  over: number;
  ball: number;
  commentary: string;
  type: CommentaryType;
  timestamp: Date;
}

// Food Types
export type FoodType = 'VEGETARIAN' | 'NON_VEGETARIAN';
export type CounterStatus = 'OPEN' | 'CLOSED' | 'BUSY' | 'FAST';

export interface FoodCounter {
  id: string;
  counterName: string;
  foodType: FoodType;
  currentQueue: number;
  estimatedWait: number;
  status: CounterStatus;
  throughputRate: number;
  lastUpdated: Date;
}

// Committee Types
export interface Committee {
  id: string;
  fullName: string;
  department: string;
  whatsappNumber: string;
  emergencyContact?: string;
  email?: string;
  assignedTeam?: string;
  experienceLevel: ExperienceLevel;
  availabilityPlanning: boolean;
  availabilitySetup: boolean;
  availabilityMorning: boolean;
  availabilityAfternoon: boolean;
  checkedIn: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Award Types
export interface Award {
  id: string;
  category: string;
  winnerId?: string;
  winner?: Player;
  teamName?: string;
  stats?: string;
  announced: boolean;
  announcedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Live Update Types
export type UpdateType = 
  | 'MATCH_SCORE' | 'ANNOUNCEMENT' | 'FOOD_UPDATE' 
  | 'EMERGENCY' | 'AWARD' | 'GENERAL' | 'WEATHER' | 'PHOTO_UPLOAD';

export type Priority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface LiveUpdate {
  id: string;
  type: UpdateType;
  title: string;
  message: string;
  priority: Priority;
  targetAudience?: string;
  mediaUrls: string[];
  reactions: Record<string, number>;
  matchId?: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Notification Types
export type NotificationType = 
  | 'MATCH_REMINDER' | 'MATCH_STARTING' | 'FOOD_READY' 
  | 'TEAM_ASSIGNED' | 'AWARD_CEREMONY' | 'EMERGENCY' 
  | 'GENERAL' | 'RAIN_DELAY';

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Photo Types
export interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  playerId?: string;
  matchId?: string;
  tags: string[];
  likes: number;
  approved: boolean;
  createdAt: Date;
}

// Poll Types
export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  active: boolean;
  category: string;
  matchId?: string;
  createdAt: Date;
  expiresAt: Date;
}

// Incident Types
export type IncidentType = 'MEDICAL' | 'SECURITY' | 'WEATHER' | 'TECHNICAL' | 'OTHER';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'REPORTED' | 'RESPONDING' | 'RESOLVED';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  location: string;
  description: string;
  reportedBy: string;
  assignedTo?: string;
  status: IncidentStatus;
  timeline: any[];
  createdAt: Date;
  resolvedAt?: Date;
}

// Dashboard Types
export interface DashboardStats {
  players: {
    total: number;
    attended: number;
    attendanceRate: number;
  };
  teams: {
    total: number;
  };
  matches: {
    total: number;
    live: number;
    completed: number;
    upcoming: number;
  };
  food: {
    collected: number;
    pending: number;
    collectionRate: number;
  };
  committee: {
    total: number;
    active: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  status: string;
  data: T;
  count?: number;
  message?: string;
}
