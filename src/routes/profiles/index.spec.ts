/* eslint-disable max-lines-per-function */
import { getRoute } from "$test-helpers/routes";
import { app } from "$test-helpers/root-hooks";
import { strictEqual } from "assert";
import { basicUser, createTestProfile, deleteTestProfiles } from "$test-fixtures/profiles";

const url = getRoute(__filename);

describe(url, function () {
  afterEach(async function () {
    await deleteTestProfiles();
  });

  describe("POST", function () {
    it("creates a profile", async function () {
      const response = await app.inject({ url, method: "POST", payload: basicUser });
      const profile = response.json()?.profile;
      strictEqual(response.statusCode, 200);
      strictEqual(profile.username, basicUser.username);
      strictEqual(profile.bio, basicUser.bio);
      strictEqual(profile.city, basicUser.city);
    });

    it("expects a payload", async function () {
      const response = await app.inject({ url, method: "POST" });
      strictEqual(response.statusCode, 400);
    });

    it("cannot create a profile with an empty username", async function () {
      const payload = Object.assign({}, basicUser, { username: "" });
      const response = await app.inject({ url, method: "POST", payload });
      strictEqual(response.statusCode, 400);
    });

    it("cannot use an existing username", async function () {
      await createTestProfile(basicUser);
      const response = await app.inject({ url, method: "POST", payload: basicUser });
      const error = response.json();
      strictEqual(response.statusCode, 409);
      strictEqual(error.code, "PROFILE_EXISTS");
    });
  });
});
