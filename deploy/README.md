# Deploying this project

## Table of contents

- [Deploying this project](#deploying-this-project)
  - [Table of contents](#table-of-contents)
  - [Manual deployment](#manual-deployment)
  - [Deploy using Docker](#deploy-using-docker)
    - [Building an image](#building-an-image)
    - [Running the image](#running-the-image)
  - [Administration](#administration)
    - [Data migration](#data-migration)
    - [Supervision](#supervision)
  - [Troubleshooting](#troubleshooting)
    - [Command not found or not recognized](#command-not-found-or-not-recognized)
    - [Missing `pino-pretty` module](#missing-pino-pretty-module)
    - [Test pipelines fail without reason](#test-pipelines-fail-without-reason)

## Manual deployment

You need to:

1. Have [Node.js](https://nodejs.org/en/) installed on your machine
2. Clone this repository locally using Git, and `cd` into the directory
3. Create a `.npmrc` file and configure an access token to Keybas' private NPM registry ;
   you can ask us to provide you with this file (it must stay private — do not commit it!)
4. Run `npm ci` to install required dependencies
5. Create a `.env` file and configure all environment variables

Then will be able to run the following commands to build _then_ run the project:

```sh
npm run build
npm run start
```

## Deploy using Docker

### Building an image

There is a Gitlab CI job configured that publishes a Docker image in the private container
registry for this project. This job is run every time a commit is pushed/merged onto the
`main` branch.

It is possible to pull and run this image locally or on a server, after authenticating
with `docker login registry.gitlab.com`. The image identifier should be:

```text
registry.gitlab.com/france-atelier/templates/template-backend-fastify:latest
```

If you have made local changes to the codebase and wish to generate your own image,
you can also generate the image locally with `docker build .` in the repository.

In order to build the image manually, you need to create a `.npmrc` file and
configure an access token to Keybas' private NPM registry ; you can ask us to provide
you with this file (it must stay private — do not commit it!).

### Running the image

In order to run, this project needs values for the environment
variables shown in the project's [`.env.example`](./.env.example) file.

Using Docker, this requires you to:

1. Create a `.env` file with all the right variables declared
2. Create a network to allow communication between this service and the database
3. Create volumes for data persistence (for both the DB and this service)
4. Run both images with the correct network, volumes, and environment variables

It is easier, and recommended, to use a Compose file to run this project.
For a working example, take a look at the [`docker-compose.yml`](docker-compose.yml)
file provided with this repository.

With a few tweaks to this Compose file (to set your own values for the environment
variables, to point volumes to the correct directories for data persistence), running
the project is straightforward:

```sh
# Download or update the images
docker-compose pull
# Run the services in the background
# After an image update or config change, you may add the `--force-recreate` flag
docker-compose up -d
```

## Administration

### Data migration

TODO

### Supervision

This project exports liveness and readiness probes for K8S, as well as Prometheus
metrics, and JSON logs that can be sent asynchronously to a third-party service
for log analysis and monitoring.

TODO

## Troubleshooting

### Command not found or not recognized

When running an NPM script (for instance `npm run build`), this error happens
when the required dependencies are missing. Simply run `npm ci` on the command
line to install all the project's dependencies, then try again.

### Missing `pino-pretty` module

The `pino-pretty` package is installed as a dev-only dependency. If you're running
the project as a Docker container, dev dependencies are not included and you should
set the `NODE_ENV` environment variable to `production` to prevent the application
from trying to load `pino-pretty`.

### Test pipelines fail without reason

Sometimes most CI pipelines will fail at once, seemingly without good reason (for
instance, the build works locally, whereas the build in the CI environment fails).
That is often caused by the expiration of the pipeline's NPM cache. The job log
will show the following messages somewhere before the main script execution:

```text
Restoring cache
Checking cache for <hash>...
FATAL: file does not exist
Failed to extract cache
```

There is a cache generated every time the `package.json` file is updated, that is set
to expire after 14 days. This error means that this cache has expired (or has not been
generated at all, in case the repository has just been created).

The current workaround, until CI jobs have better cache management abilities, is to
update the `package.json` (you can make a minor update to a dev package, or bump up
the minor version number of the project, or something). Improvise. Adapt. Overcome.
