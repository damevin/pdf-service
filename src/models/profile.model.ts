import { Document, model, Schema } from "mongoose";
import { Fields, Timestamps, timestamps } from "./utils";

export interface ProfileBase {
  /** If set to true, this user is "archived", and should no longer be accessible. */
  archived: boolean;
  /** The username for this profile. */
  username: string;
  /** A biography to be displayed on the profile's webpage. */
  bio: string;
  /** Main city of residence for this user. */
  city: string;
  /** Creation date (automatic). */
  createdAt?: Date;
  /** Last updated date (automatic). */
  updatedAt?: Date;
}

export interface Profile extends Document, Timestamps<ProfileBase> {}

const profileFields: Fields<Timestamps<ProfileBase>> = {
  archived: { type: Boolean, default: false, index: true },
  username: { type: String, required: true, index: true },
  bio: { type: String, default: "" },
  city: { type: String, default: "Earth" },
  ...timestamps,
};

const profileSchema = new Schema<Profile>(profileFields, { timestamps: true });
export const Profiles = model<Profile>("profiles", profileSchema);
