import { FromSchema } from "json-schema-to-ts";

const username = {
  type: "string",
  minLength: 1,
  pattern: "^[A-Za-z0-9_-]+$",
} as const;

export const GET_PROFILE = {
  type: "object",
  properties: {
    username,
  },
  required: ["username"],
} as const;

export const PROFILE_BODY = {
  type: "object",
  properties: {
    username,
    bio: { type: "string", default: "" },
    city: { type: "string", default: "Earth" },
  },
  required: ["username", "bio"],
} as const;

export const PROFILE_RESPONSE = {
  type: "object",
  description: "A user profile (OK)",
  properties: {
    profile: {
      type: "object",
      properties: {
        ...PROFILE_BODY.properties,
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
} as const;

export type GetProfile = FromSchema<typeof GET_PROFILE>;
export type ProfileBody = FromSchema<typeof PROFILE_BODY>;
export type ProfileResponse = FromSchema<typeof PROFILE_RESPONSE>;
