import type { FastifyInstance } from "fastify";
import type { File as MulterFile } from "fastify-multer/lib/interfaces";
import fastifyNow from "fastify-now";
import fastifySensible from "fastify-sensible";
import formbody from "fastify-formbody";
import multer from "fastify-multer";
import { join } from "path";
import pkg from "../package.json";
import { Context, ContextAuth } from "$services/pre-handlers/helpers";
import { NotSignedIn } from "$errors/auth.errors";

export const setupApp = (server: FastifyInstance): FastifyInstance => {
  // Configure the server
  server.decorate("app", {
    name: pkg.name,
    version: pkg.version,
  });
  server.log.info(`Setting up ${server.app.name} version ${server.app.version}`);

  // Load configuration and plugins
  server.register(fastifySensible);
  server.register(multer.contentParser);
  server.register(formbody);

  // Request helpers
  server.decorateRequest("getContext", function (): Context {
    return { log: this.log };
  });
  server.decorateRequest("getContextAuth", function (): ContextAuth {
    if (!this.user) {
      throw new NotSignedIn();
    }
    return { log: this.log, user: this.user };
  });

  // Load routes
  server.register(fastifyNow, {
    routesFolder: join(__dirname, "./routes"),
    // Can also provide a prefix
    // pathPrefix: '/api'
  });
  return server;
};

// Support for file uploads, extra schema properties, and context decorators
declare module "fastify" {
  export interface FastifyRequest {
    file?: MulterFile;
    getContext: () => Context;
    getContextAuth: () => ContextAuth;
  }

  export interface FastifyInstance {
    app: {
      name: string;
      version: string;
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  export interface FastifySchema {
    [key: string]: unknown;
  }
}
