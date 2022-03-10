import { FromSchema } from "json-schema-to-ts";

export const GENERATE_BODY = {
  type: "string",
} as const;

export type GenerateBody = FromSchema<typeof GENERATE_BODY>;
