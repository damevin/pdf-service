import { Profile, ProfileBase, Profiles } from "$models/profile.model";
import { ProfileBody } from "$schemas/profiles.schemas";
import { factory } from "factory-girl";
import faker from "faker";

factory.define<ProfileBody>("Profile", Profiles, {
  archived: false,
  username: () => faker.name.firstName(),
  bio: () => faker.lorem.sentence(),
  city: () => faker.address.city(),
});

export const createTestProfile = async (params: Partial<ProfileBase> = {}): Promise<Profile> => {
  const testProfile = await factory.build<ProfileBody>("Profile", params);
  return await insertTestProfile(testProfile);
};

export const insertTestProfile = async (testProfile: ProfileBody): Promise<Profile> => {
  return await Profiles.create(testProfile);
};

export const deleteTestProfiles = async (): Promise<void> => {
  await Profiles.deleteMany({});
};
