import { Document, LeanDocument, model, Schema } from "mongoose";
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
}

export interface ProfileDoc extends Document, ProfileBase, Timestamps {}

export interface Profile extends LeanDocument<ProfileDoc> {}

const profileFields: Fields<ProfileBase> = {
  archived: { type: Boolean, default: false, index: true },
  username: { type: String, required: true, index: true },
  bio: { type: String, default: "" },
  city: { type: String, default: "Earth" },
  ...timestamps,
};

const profileSchema = new Schema<ProfileDoc>(profileFields, { timestamps: true });
export const ProfileModel = model<ProfileDoc>("profiles", profileSchema);
