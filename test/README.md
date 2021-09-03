# Testing this project

The test runner is [Mocha](https://mochajs.org/). The assertion library in
use is Node's native [`assert` module](https://nodejs.org/docs/latest-v14.x/api/assert.html).

To run test, you need to run the `npm run test` command.
You can also run tests with coverage analysis (as is done in CI pipelines)
with `npm run test:ci`.

## Writing tests

Tests have the extension `.spec.ts`, and can be written in two places:

- Directly alongside the routes.  
  For instance, if you have a route in `src/routes/users/search.ts`, the
  associated test suite would be in `src/routes/users/search.spec.ts`.
- For unit tests, in the `test/unit` directory.  
  Tests for a feature could be in `test/unit/myService/myFeature.spec.ts`.

If you need to write other kinds of test (behavior tests, smoke/canary tests,
or anything else), it is possible. If you need to install dev dependencies to
mock, spy or stub services (like sinon), generate more test data (like
json-schema-faker), perform property-based testing (like fast-check), or
anything else, please go ahead!

In the test examples, [`faker`](https://github.com/Marak/Faker.js) and
[`factory-girl`](https://github.com/simonexmachina/factory-girl) are used
to generate fake data.

## Route tests

A GET function in the `src/routes/users/search.ts` file will be mapped to the
`GET /users/search` HTTP route. You can test it by writing a `.spec.ts` file
alongside the route file. Helpers are provided to easily recover the
Fastify instance, and easily get the URL to inject requests.

```js
// src/routes/users/search.spec.ts

import { getRoute } from "$test-helpers/routes";
import { app } from "$test-helpers/root-hooks";

// `__filename` is an automatic variable provided by TypeScript
// `getRoute()` extracts the relevant part to form the route path
// in this case, url = "/users/search"
const url = getRoute(__filename);

describe(url, function () {
  it("GET returns 200", async function () {
    // `app` is the Fastify instance used for tests (imported above)
    // `.inject()` is a method provided by Fastify to test HTTP requests
    const response = await app.inject({ method: "GET", url: url });
    strictEqual(response.statusCode, 200);
  });
});
```

For routes with URL parameters, you should use `getRouteWithParams()` instead
of `getRoute()`. This helper is documented in `test/helpers/routes.ts`.

## Unit tests

Unit tests can be written in the `test/unit` directory. No structure is
enforced yet in this directory, as long as all test file names end with
`.spec.ts`.

## Test-driven development

When writing a new route or a service method, or when fixing an existing one,
it is recommended to first write failing tests for this route or method, to
describe what is expected, and only then to write the code that will make
these tests pass.

We encourage this approach. However, as we did not prepare adapted tooling,
methodology and documentation for this, we do not enforce TDD yet.

## Further reading

- [Testing Fastify applications](https://www.fastify.io/docs/latest/Testing/)
- [Documentation for Node's `assert` module](https://nodejs.org/docs/latest-v14.x/api/assert.html)
- [JavaScript & Node.js testing best practices](https://github.com/goldbergyoni/javascript-testing-best-practices) by Yoni Goldberg.
  We recommend reading this guide, that describes good, established industry approaches to software testing for JS projects.
- [XUnit Test Patterns](http://xunitpatterns.com/Book%20Outline.html), a decent book about software tests in general.
