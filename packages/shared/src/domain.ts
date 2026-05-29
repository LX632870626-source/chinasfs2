export const positions = ["门将", "后卫", "中场", "前锋"] as const;
export type Position = (typeof positions)[number];

export const playerPublicLevels = ["PUBLIC", "PRIVATE"] as const;
export type PlayerPublicLevel = (typeof playerPublicLevels)[number];

export const matchStatuses = ["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

export const submissionStatuses = ["PENDING", "ADOPTED", "REJECTED"] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];

export type PublicPlayer = {
  id: string;
  name: string;
  ageGroup: string;
  position: Position;
  teamName: string;
  region: string;
  traits: string[];
  bio: string;
  coverUrl: string | null;
  publicVideoUrl: string | null;
  isFeatured: boolean;
  featureOrder: number;
};

export type AdminPlayer = PublicPlayer & {
  birthday: string | null;
  heightCm: number | null;
  weightKg: number | null;
  dominantFoot: string | null;
  schoolOrOrg: string | null;
  contactName: string | null;
  contactPhone: string | null;
  source: string | null;
  adminNotes: string | null;
  publicLevel: PlayerPublicLevel;
  isPublished: boolean;
};

export type PublicEvent = {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  summary: string;
  coverUrl: string | null;
  officialUrl: string | null;
};

export type PublicMatch = {
  id: string;
  eventId: string;
  startsAt: string;
  homeTeam: string;
  awayTeam: string;
  score: string | null;
  status: MatchStatus;
  officialUrl: string | null;
  featuredPlayerIds: string[];
};
