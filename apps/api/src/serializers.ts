import {
  toPublicPlayer,
  type AdminPlayer,
  type PublicEvent,
  type PublicMatch,
  type PublicPlayer
} from "@future-stars/shared";

type DbPlayer = {
  id: string;
  name: string;
  ageGroup: string;
  position: string;
  teamName: string;
  region: string;
  traitsJson: string;
  bio: string;
  coverUrl: string | null;
  publicVideoUrl: string | null;
  isFeatured: boolean;
  featureOrder: number;
  birthday: string | null;
  heightCm: number | null;
  weightKg: number | null;
  dominantFoot: string | null;
  schoolOrOrg: string | null;
  contactName: string | null;
  contactPhone: string | null;
  source: string | null;
  adminNotes: string | null;
  publicLevel: string;
  isPublished: boolean;
};

type DbEvent = {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  location: string;
  startsAt: Date;
  endsAt: Date | null;
  status: string;
  summary: string;
  coverUrl: string | null;
  officialUrl: string | null;
};

type DbMatch = {
  id: string;
  eventId: string;
  startsAt: Date;
  homeTeam: string;
  awayTeam: string;
  score: string | null;
  status: string;
  officialUrl: string | null;
  featuredPlayerIdsJson: string;
};

function parseStringArray(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function parseFeaturedPlayerIds(json: string): string[] {
  return parseStringArray(json);
}

export function serializePublicPlayer(player: DbPlayer): PublicPlayer {
  const adminPlayer: AdminPlayer = {
    ...player,
    position: player.position as AdminPlayer["position"],
    traits: parseStringArray(player.traitsJson),
    publicLevel: player.publicLevel as AdminPlayer["publicLevel"]
  };

  return toPublicPlayer(adminPlayer);
}

export function serializePublicEvent(event: DbEvent): PublicEvent {
  return {
    id: event.id,
    name: event.name,
    ageGroup: event.ageGroup,
    region: event.region,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    status: event.status,
    summary: event.summary,
    coverUrl: event.coverUrl,
    officialUrl: event.officialUrl
  };
}

export function serializePublicMatch(match: DbMatch): PublicMatch {
  return {
    id: match.id,
    eventId: match.eventId,
    startsAt: match.startsAt.toISOString(),
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    score: match.score,
    status: match.status as PublicMatch["status"],
    officialUrl: match.officialUrl,
    featuredPlayerIds: parseFeaturedPlayerIds(match.featuredPlayerIdsJson)
  };
}
