import type { FromSchema } from "json-schema-to-ts";

/** JSON schema that represents an hexadecimal MongoDB ObjectId. */
export const OBJECT_ID = {
  type: "string",
  minLength: 24,
  maxLength: 24,
  pattern: "^[a-fA-F0-9]{24}$",
  errorMessage: "should be a valid ObjectId",
} as const;

/** JSON schema that expects an object in the form `{ id: ObjectId }`. */
export const GET_OBJECT_ID = {
  type: "object",
  properties: {
    id: OBJECT_ID,
  },
  required: ["id"],
} as const;

export type GetObjectId = FromSchema<typeof GET_OBJECT_ID>;

/** JSON schema that represents a controller error. */
export const ERROR_SCHEMA = {
  type: "object",
  description: "Unexpected error",
  properties: {
    statusCode: { type: "number" },
    code: { type: "string" },
    error: { type: "string" },
    message: { type: "string" },
  },
};
