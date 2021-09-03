# Backend skeleton project

This is a skeleton project for a REST API using [NodeJS](https://nodejs.org/en/),
[TypeScript](https://www.typescriptlang.org/) and [Fastify](https://www.fastify.io/).

It connects to a [MongoDB database](https://www.mongodb.com/) using
[Mongoose](https://mongoosejs.com/).

## Configuration

### NPM configuration

In order to install some private dependencies, you will need to create a `.npmrc` file
with an access token to Keybas' private NPM registry.

### Project configuration

This project is configured through environment variables. They should be set either
in the external environment (from command-line, docker...) or in the `.env` file when
it is more practical to do so.

All required variables are listed in the `.env.example` file. In code, they are
declared and validated in the `src/boot/environment.ts` file, that you can refer
to for reference, and that you can update to add your own variables when required.

## Development

### Workflow

We recommend you to work using branches and merge requests, in order to avoid committing too
often to the `main` branch and running useless pipelines too often (like the `publish` job).

Merge requests also allow you to check validity (everything compiles), test coverage,
code quality and style, prior to merging in the main branch, which is often good to ensure
quality stays consistent at all times. They also help when several people are working at
the same time on a given project, to be able to work in isolation on their separate issues
or user stories, and thus reducing conflicts.

### Commands

Useful NPM scripts on this project:

```sh
# Lint
npm run lint:eslint
npm run lint:format

# Run in development mode
npm run watch

# Format all files to match project configuration
npm run format
```

### Project structure

```text
src/
  boot/     Startup files. Code related to preparing and starting the server.
            Files in this directory are ignored by the test coverage.
  errors/   A single place to declare custom errors classes for the whole project.
  models/   Database (Mongoose) models.
  routes/   All files in this directory are loaded as "routes", i.e. API endpoints, aka controllers.
  schemas/  A single place to store all JSON schemas used to validate the routes' inputs and outputs.
  services/ Everything that should be abstracted from the routes.

test/
  fixtures/ Utilities specifically used to generate or inject test data.
  helpers/  General testing utilities.
  unit/     Unit tests for services.
```

### Writing routes

This project uses [fastify-now](https://github.com/yonathan06/fastify-now) to load all TS
files in the `routes` directory as endpoints, automatically, based on the directory structure.
URL parameters are written in between \[square brackets\].

For instance, `src/routes/user/[userId].ts` will become the `/user/:userId` endpoint.
You can refer to fastify-now's documentation for more details. We recommend you to avoid
using `:`, and to only use `[]`, since `:` is disallowed in file names on certain operating
systems, which can block operations like `git clone`.

It is recommended that endpoint tests for these routes be present in the same directory,
directy alongside the test file. For instance, the routes in `src/routes/user/me.ts` should
be tested in `src/routes/user/me.spec.ts`. Helpers like `getRoute` or `getRouteWithParams`
are provided to help with writing tests.

You can refer to the example routes in this project, to learn how to write and test routes.

These routes use JSON schemas for input (and output) data validation, that are defined in
`src/schemas`. TypeScript types can be infered from `as const` JSON schemas, as shown in
the examples. A single schema is used at the same time to validate data, to add typings to
the routes, and also to generate a swagger / OpenAPI documentation at runtime.
This documentation can be read at the `/docs` endpoint when the server is running.

### Logging

It is advised to avoid `console`. In most cases, the recommended way to log things
is to use the `request.log` object, which is a [Pino instance](https://getpino.io/#/).

This logger can be passed along from your controllers to your services. We recommend
doing so through a Context object, that can be passed again to other services. Please
refer to the example routes and services in this project as a showcase of how to use
the logger.

Good to keep in mind: when logging an object, it should be the first parameter.
Also, it should not contain sensitive information. Pino allows you to
[redact such information](https://github.com/pinojs/pino/blob/master/docs/redaction.md).

```js
request.log.info({ data: "something" }, "The log message comes after the object");
```

## Testing

The test runner is [Mocha](https://mochajs.org/). The assertion library in use is
the native [NodeJS `assert` module](https://nodejs.org/api/assert.html).

For more details on how to write tests, see [test/README.md](test/README.md);

## Deployment

### Manual

You need to:

- Spin up a MongoDB database
- Clone this repository
- Create a `.npmrc` file and configure an access token to Keybas' private NPM registry
- Run `npm ci` to install required dependencies
- Create a `.env` file and configure all environment variables

Then will be able to run the following commands to build _then_ run the project:

```sh
npm run build
npm run start
```

### With Docker

There is a Gitlab CI job configured that publishes a Docker image in the
private container registry for this project. This job is run every time a
commit is pushed/merged onto the `main` branch.

It is possible to pull and run this image locally or on a server, after
authenticating with `docker login`. You can also generate this image
locally with `docker build .` after cloning the repository.

It is recommended to use docker-compose to run this project. You will
need to depend on a MongoDB database (that may be external), and to
configure all environment variables in your Dockerfile.
