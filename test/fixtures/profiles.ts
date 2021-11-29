import { ProfileBase, ProfileDoc, ProfileModel } from "$models/profile.model";
import { Factory } from "fishery";
import faker from "faker";

export const profileFactory = Factory.define<ProfileBase, unknown, ProfileDoc>(({ onCreate }) => {
  // Allow .create() to insert into DB
  onCreate(async (base) => await ProfileModel.create(base));

  return {
    archived: false,
    username: faker.name.firstName(),
    bio: faker.lorem.sentence(),
    city: faker.address.city(),
  };
});

export const deleteTestProfiles = async (): Promise<void> => {
  await ProfileModel.deleteMany({});
};
