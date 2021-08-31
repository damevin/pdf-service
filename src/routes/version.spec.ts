import { getRoute } from "$test-helpers/routes";
import { app } from "$test-helpers/root-hooks";
import { strictEqual } from "assert";
import pkg from "../../package.json";

const url = getRoute(__filename);

describe(url, function () {
  describe("GET", function () {
    it("returns the current package version", async function () {
      const response = await app.inject(url);
      strictEqual(response.statusCode, 200);
      strictEqual(response.payload, pkg.version);
    });
  });
});
