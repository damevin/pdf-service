import { Profile, ProfileBase, Profiles } from "$models/profile.model";

export const basicUser: ProfileBase = {
  archived: false,
  username: "Winter",
  bio: "I am a software developer and I like baking.",
  city: "Grenoble",
};

export const createTestProfile = async (params: Partial<ProfileBase> = {}): Promise<Profile> => {
  return await Profiles.create(Object.assign({}, basicUser, params));
};

export const deleteTestProfiles = async (): Promise<void> => {
  await Profiles.deleteMany({});
};
