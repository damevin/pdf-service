import { Profile, ProfileModel } from "$models/profile.model";
import { ProfileBody } from "$schemas/profiles.schemas";
import { Context, ContextAuth } from "./pre-handlers/helpers";

export const findProfile = async (ctx: Context, username: string): Promise<Profile | null> => {
  ctx.log.debug({ username }, "Fetching profile");
  return await ProfileModel.findOne({ archived: false, username }).lean();
};

export const checkProfile = async (ctx: Context, username: string): Promise<boolean> => {
  ctx.log.debug({ username }, "Checking profile exists");
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return await ProfileModel.exists({ archived: false, username });
};

export const createProfile = async (ctx: Context, body: ProfileBody): Promise<Profile> => {
  ctx.log.debug({ username: body.username }, "Creating profile");
  return await ProfileModel.create(body);
};

export const updateProfile = async (
  ctx: ContextAuth,
  username: string,
  body: Partial<ProfileBody>
): Promise<void> => {
  ctx.log.debug({ username }, "Updating profile");
  await ProfileModel.updateOne({ archived: false, username }, { $set: body });
};
