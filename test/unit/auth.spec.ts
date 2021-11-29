/* eslint-disable max-lines-per-function */
import { rejects, strictEqual } from "assert";
import { deleteTestProfiles, profileFactory } from "$test-fixtures/profiles";
import { getUser } from "$services/pre-handlers/auth.service";
import { Types } from "mongoose";

describe("Authentication service", function () {
  describe("The authentication middleware", function () {
    afterEach(async function () {
      await deleteTestProfiles();
    });

    it("returns the current user", async function () {
      const testUser = await profileFactory.create();
      const user = await getUser("Bearer " + String(testUser._id));
      strictEqual(user.username, testUser.username);
    });

    it("rejects when authorization header is missing or empty", async function () {
      const expected = {
        code: "MISSING_HEADER_AUTHORIZATION",
        statusCode: 400,
      };
      await rejects(getUser(), expected);
      await rejects(getUser(""), expected);
    });

    it("rejects when authorization header is malformed", async function () {
      const expected = {
        code: "BAD_HEADER_AUTHORIZATION",
        statusCode: 400,
      };
      const id = String(new Types.ObjectId());
      await rejects(getUser("Beraer " + id), expected);
      await rejects(getUser("Bearer NotAnObjectId"), expected);
      await rejects(getUser(id), expected);
    });

    it("rejects when the user does not exist", async function () {
      const id = String(new Types.ObjectId());
      await rejects(getUser("Bearer " + id), {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    });
  });
});
