/* eslint-disable max-lines-per-function */
import { getRouteWithParams } from "$test-helpers/routes";
import { app } from "$test-helpers/root-hooks";
import { strictEqual } from "assert";
import { createTestProfile, deleteTestProfiles } from "$test-fixtures/profiles";
import { Profile } from "$models/profile.model";

const route = getRouteWithParams(__filename);

describe(route.route, function () {
  let testUser: Profile;
  let otherUser: Profile;

  afterEach(async function () {
    await deleteTestProfiles();
  });

  describe("GET", function () {
    it("returns the correct user data", async function () {
      testUser = await createTestProfile();
      const url = route.build(testUser.username);

      const response = await app.inject(url);
      const profile = response.json()?.profile;
      strictEqual(response.statusCode, 200);
      strictEqual(profile.username, testUser.username);
      strictEqual(profile.bio, testUser.bio);
      strictEqual(profile.city, testUser.city);
    });

    it("doesn't return a user that does not exist", async function () {
      testUser = await createTestProfile({ username: "Found" });
      const url = route.build("NotFound");

      const response = await app.inject(url);
      const error = response.json();
      strictEqual(response.statusCode, 404);
      strictEqual(error.code, "PROFILE_NOT_FOUND");
    });

    it("doesn't return a user that has been archived", async function () {
      testUser = await createTestProfile({ archived: true });
      const url = route.build(testUser.username);

      const response = await app.inject(url);
      const error = response.json();
      strictEqual(response.statusCode, 404);
      strictEqual(error.code, "PROFILE_NOT_FOUND");
    });
  });

  describe("PUT", function () {
    it("expects a payload", async function () {
      testUser = await createTestProfile();
      const url = route.build(testUser.username);

      const response = await app.inject({ url, method: "PUT" });
      strictEqual(response.statusCode, 400);
    });

    it("fails if not authenticated", async function () {
      testUser = await createTestProfile();
      const url = route.build(testUser.username);
      const payload = {
        username: "NewName",
        bio: "NewBio",
      };

      const response = await app.inject({ url, method: "PUT", payload });
      const error = response.json();
      strictEqual(response.statusCode, 400);
      strictEqual(error.code, "MISSING_HEADER_AUTHORIZATION");
    });

    it("updates the profile correctly", async function () {
      testUser = await createTestProfile();
      const url = route.build(testUser.username);
      const headers = { authorization: "Bearer " + String(testUser._id) };
      const payload = {
        username: "NewName",
        bio: "NewBio",
        city: "Toulouse",
      };

      const update = await app.inject({ url, method: "PUT", headers, payload });
      strictEqual(update.statusCode, 204);

      // New url is the new username
      const response = await app.inject(route.build(payload.username));
      const profile = response.json()?.profile;
      strictEqual(response.statusCode, 200);
      strictEqual(profile.username, payload.username);
      strictEqual(profile.bio, payload.bio);
      strictEqual(profile.city, payload.city);
    });

    it("can keep the same username", async function () {
      testUser = await createTestProfile();
      const url = route.build(testUser.username);
      const headers = { authorization: "Bearer " + String(testUser._id) };
      const payload = {
        username: testUser.username,
        bio: "NewBio",
      };

      const update = await app.inject({ url, method: "PUT", headers, payload });
      strictEqual(update.statusCode, 204);
    });

    it("cannot replace an existing username", async function () {
      testUser = await createTestProfile();
      otherUser = await createTestProfile({ username: "OtherUser" });
      const url = route.build(testUser.username);
      const headers = { authorization: "Bearer " + String(testUser._id) };
      const payload = {
        username: otherUser.username,
        bio: "NewBio",
      };

      const update = await app.inject({ url, method: "PUT", headers, payload });
      const error = update.json();
      strictEqual(update.statusCode, 409);
      strictEqual(error.code, "PROFILE_EXISTS");
    });

    it("cannot update another user's profile", async function () {
      testUser = await createTestProfile();
      const url = route.build("OtherUser");
      const headers = { authorization: "Bearer " + String(testUser._id) };
      const payload = {
        username: otherUser.username,
        bio: "NewBio",
      };

      const update = await app.inject({ url, method: "PUT", headers, payload });
      const error = update.json();
      strictEqual(update.statusCode, 401);
      strictEqual(error.code, "UNAUTHORIZED");
    });
  });
});
