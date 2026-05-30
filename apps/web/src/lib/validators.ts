import { z } from "zod";

export const submissionSchema = z.object({
  type: z.enum(["PLAYER", "EVENT"]),
  contactName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(5),
  content: z.string().trim().min(10),
  attachmentUrl: z.string().trim().url().optional().or(z.literal(""))
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

export const playerSchema = z.object({
  name: z.string().trim().min(1),
  ageGroup: z.string().trim().min(1),
  position: z.string().trim().min(1),
  teamName: z.string().trim().min(1),
  region: z.string().trim().min(1),
  traits: z.array(z.string()).default([]),
  bio: z.string().default(""),
  coverUrl: z.string().url().nullable().optional(),
  publicVideoUrl: z.string().url().nullable().optional(),
  isFeatured: z.boolean().default(false),
  featureOrder: z.number().int().default(0),
  birthday: z.string().nullable().optional(),
  heightCm: z.number().int().nullable().optional(),
  weightKg: z.number().int().nullable().optional(),
  dominantFoot: z.string().nullable().optional(),
  schoolOrOrg: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
  publicLevel: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  isPublished: z.boolean().default(false)
});
