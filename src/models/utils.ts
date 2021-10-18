import type { SchemaDefinition, SchemaDefinitionType } from "mongoose";

/**
 * A Mongoose schema that matches the given TypeScript interface.
 * The interface MUST NOT inherit Mongoose's `Document`.
 */
export type Fields<T> = Required<SchemaDefinition<SchemaDefinitionType<T>>>;

/**
 * A function that should be used as `default` for Date fields in Mongoose schemas.
 */
export const now = (): Date => new Date();

/**
 * Timestamps for Mongoose schemas with auto timestamps.
 */
export const timestamps = {
  createdAt: { type: Date, default: now },
  updatedAt: { type: Date, default: now },
};

/**
 * Interface that represents automatic timestamps.
 */
export interface Timestamps {
  /** Creation date (automatic). */
  createdAt: Date;
  /** Last updated date (automatic). */
  updatedAt: Date;
}
