import type { AdminPlayer, PublicPlayer } from "./domain.js";

type SensitivePlayerField = Exclude<keyof AdminPlayer, keyof PublicPlayer>;

export const sensitivePlayerFields = [
  "birthday",
  "heightCm",
  "weightKg",
  "dominantFoot",
  "schoolOrOrg",
  "contactName",
  "contactPhone",
  "source",
  "adminNotes",
  "publicLevel",
  "isPublished"
] as const satisfies readonly SensitivePlayerField[];

type AssertNever<T extends never> = T;
type _SensitivePlayerFieldsAreExact = AssertNever<
  Exclude<SensitivePlayerField, (typeof sensitivePlayerFields)[number]>
>;

export function toPublicPlayer(player: AdminPlayer): PublicPlayer {
  return {
    id: player.id,
    name: player.name,
    ageGroup: player.ageGroup,
    position: player.position,
    teamName: player.teamName,
    region: player.region,
    traits: player.traits,
    bio: player.bio,
    coverUrl: player.coverUrl,
    publicVideoUrl: player.publicVideoUrl,
    isFeatured: player.isFeatured,
    featureOrder: player.featureOrder
  };
}
