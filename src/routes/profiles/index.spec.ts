/* eslint-disable max-lines-per-function */
import { getRoute } from "$test-helpers/routes";
import { app } from "$test-helpers/root-hooks";
import { strictEqual } from "assert";
import { deleteTestProfiles, profileFactory } from "$test-fixtures/profiles";
import { FastifyError } from "fastify-error";
import { ProfileResponse } from "$schemas/profiles.schemas";

const url = getRoute(__filename);

describe(url, function () {
  afterEach(async function () {
    await deleteTestProfiles();
  });

  describe("POST", function () {
    it("creates a profile", async function () {
      const payload = profileFactory.build();
      const response = await app.inject({ url, method: "POST", payload });
      const profile = response.json()?.profile as ProfileResponse["profile"];
      strictEqual(response.statusCode, 200, response.payload);
      strictEqual(profile?.username, payload.username);
      strictEqual(profile?.bio, payload.bio);
      strictEqual(profile?.city, payload.city);
    });

    it("expects a payload", async function () {
      const response = await app.inject({ url, method: "POST" });
      strictEqual(response.statusCode, 400, response.payload);
    });

    it("cannot create a profile with an empty username", async function () {
      const payload = profileFactory.build({ username: "" });
      const response = await app.inject({ url, method: "POST", payload });
      strictEqual(response.statusCode, 400, response.payload);
    });

    it("cannot use an existing username", async function () {
      const profile1 = await profileFactory.create();
      const profile2 = profileFactory.build({ username: profile1.username });

      const response = await app.inject({ url, method: "POST", payload: profile2 });
      const error = response.json() as FastifyError;
      strictEqual(response.statusCode, 409, response.payload);
      strictEqual(error.code, "PROFILE_EXISTS");
    });
  });
});
