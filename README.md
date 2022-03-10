# Backend skeleton project

HTML to PDF conversion server, built using [NodeJS](https://nodejs.org/en/),
[TypeScript](https://www.typescriptlang.org/) and [Fastify](https://www.fastify.io/).

## Table of contents

- [Backend skeleton project](#backend-skeleton-project)
  - [Table of contents](#table-of-contents)
  - [Usage](#usage)
    - [Generate a PDF](#generate-a-pdf)
    - [Fonts](#fonts)
  - [Configuration](#configuration)
    - [NPM configuration](#npm-configuration)
    - [Project configuration (env vars)](#project-configuration-env-vars)
  - [Development](#development)
    - [Workflow](#workflow)
    - [Commands](#commands)
    - [Project structure](#project-structure)
    - [Add a new font](#add-a-new-font)
    - [Writing routes](#writing-routes)
    - [Logging](#logging)
    - [Keeping the documentation up-to-date](#keeping-the-documentation-up-to-date)
  - [Testing](#testing)
  - [Deployment](#deployment)
  - [Troubleshooting](#troubleshooting)

## Usage

### Generate a PDF

When the service is running (read on to know how to deploy the service), it exposes
a `/generate` endpoint that accepts POST requests with the `text/html` Content-Type.

This endpoint replies with a PDF file. In case of an error, the result may be empty (zero bytes).

Example:

```sh
curl -d @myFile.html -H 'Content-Type: text/html' http://localhost:4010/generate -o output.pdf
```

### Fonts

By default, there are no fonts installed on the server. Declaring `font-family: sans-serif`
should result in black squares instead of letters.

You can load fonts using the custom CSS present locally on the server. The following fonts
are available at the moment:

- IBM Plex Sans
- League Spartan
- Zilla Slab

```html
<!-- For maximum performance, only load the ones you actually need -->
<link href="fonts/ibm-plex-sans.css" rel="stylesheet" />
<link href="fonts/league-spartan.css" rel="stylesheet" />
<link href="fonts/zilla-slab.css" rel="stylesheet" />
<style>
  html {
    font-family: "IBM Plex Sans";
  }
  h1,
  h2,
  h3,
  h4 {
    font-family: "Zilla Slab";
  }
</style>
```

## Configuration

### NPM configuration

In order to install some private dependencies, you will need to create a `.npmrc` file
with an access token to Keybas' private NPM registry.

### Project configuration (env vars)

This project is configured through environment variables. They should be set either
in the external environment (from command-line, docker...), or preferably in a `.env`
file, that is more convenient to keep your configuration around.

All required environment variables are listed in the
[`deploy/.env.example` file](deploy/.env.example). To get this project working
out of the box, you can just copy this file to `./.env`, and change the values
to match your setup.

In code, environment variables are declared and validated in the
[`src/boot/environment.ts` file](src/boot/environment.ts), that serves as reference,
and that you can update to add your own variables.

When making changes to this project's environment variables, you should update
both the [`deploy/.env.example` file](deploy/.env.example), and the
[`deploy/docker-compose.yml` file](deploy/docker-compose.yml), to document
your changes.

## Development

This project has been configured for Node.js v16 (LTS) and NPM 8. If you're often
working with other projects, you can install `nvm`
([Linux version](https://github.com/nvm-sh/nvm),
[Windows version](https://github.com/coreybutler/nvm-windows)) to help change
Node versions quickly and often.

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
  routes/   All files in this directory are loaded as "routes", i.e. API endpoints, aka controllers.
  schemas/  A single place to store all JSON schemas used to validate the routes' inputs and outputs.
  services/ Everything that should be abstracted from the routes.

test/
  fixtures/ Utilities specifically used to generate or inject test data.
  helpers/  General testing utilities.
  unit/     Unit tests for services.

fonts/      Font files.
```

### Add a new font

The underlying QtWebkit engine doesn't support WOFF2 fonts, but supports WOFF.
To add a new font, you simply need to create a CSS file for that font in the `fonts/`
directory, with all the standard `@font-face` declarations needed.
It is good practice to create a subdirectory for the WOFF files.

If you want to use a font from Google Fonts, you can use the
[Google Webfonts Helper](https://google-webfonts-helper.herokuapp.com)
application to speed up the process. Simply:

1. Select the font you want
2. Select the `latin` and `latin-ext` charsets
3. Check _all_ styles
4. Click "Modern browsers" in order to download only WOFF and WOFF2 font files
5. Change the prefix to the folder you created in the `fonts/` directory
6. Download the font files and put them in the folder you created
7. Copy the CSS and paste it in a new CSS file
8. You can remove `woff2` declarations from the CSS and `woff2` files from the folder.
   I use the following regexes to quickly remove all unwanted code from the CSS,
   then run the formatter (otherwise the file won't be valid):

   ```txt
   .+39\+ \*/
   /\* Chrome .+\*/
   ```

Once a font has been added, you can update the documentation at the [Fonts](#fonts) section
of the current README file. Commit the CSS, WOFF files, and README.md, push, and you're done!

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

### Keeping the documentation up-to-date

This project and its artifacts are not used solely by its developers, but also by
sysadmins, security analysts, QA engineers, other developers, and a bunch of other
professions. They expect that the documentation is kept up-to-date, in particular:

- [This README](./README.md)
- The [test/README.md](test/README.md) documentation
- Most importantly, the deployment documentation:
  - The [deploy/README.md](deploy/README.md) explaining how to run the project
  - The [deploy/.env.example](deploy/.env.example) file that documents all
    environment variables required to run this project (with or without Docker)
  - The [deploy/docker-compose.yml](deploy/docker-compose.yml) file that documents
    all the first-party or third-party services and their configuration

## Testing

The test runner is [Mocha](https://mochajs.org/). The assertion library in use is
the native [NodeJS `assert` module](https://nodejs.org/api/assert.html).

For more details on how to write tests, see [test/README.md](test/README.md);

## Deployment

The easiest way to get this project up and running on a server or on your computer
is using [Docker](https://www.docker.com/).

For more details on how to deploy, see [deploy/README.md](deploy/README.md);

## Troubleshooting

If you're running into an issue with this project, please check the troubleshooting
section in [deploy/README.md](deploy/README.md#troubleshooting).
