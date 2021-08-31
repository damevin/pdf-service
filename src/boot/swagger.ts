import type { FastifyInstance } from "fastify";
import type { FastifyDynamicSwaggerOptions } from "fastify-swagger";
import fastifySwagger from "fastify-swagger";
import pkg from "../../package.json";
import { env } from "./environment";

/**
 * Add OpenAPI documentation to the given Fastify instance.
 * This plugin needs to be added before routes are loaded.
 */
export const addSwagger = (server: FastifyInstance): void => {
  if (["production", "test"].includes(env.NODE_ENV)) {
    // do not add the /docs route in production or test modes
    return;
  }

  const openapi: FastifyDynamicSwaggerOptions["openapi"] = {
    info: {
      title: pkg.name,
      description: pkg.description,
      version: pkg.version,
    },
    servers: [{ url: `http://localhost:${env.PORT}/` }, { url: `http://127.0.0.1:${env.PORT}/` }],
    tags: [],
  };

  server.register(fastifySwagger, {
    routePrefix: "/docs",
    openapi,
    uiConfig: {
      deepLinking: false,
    },
    staticCSP: true,
    hideUntagged: false,
    exposeRoute: true,
  });

  server.ready((err) => {
    if (err) throw err;
    server.swagger();
  });
};
