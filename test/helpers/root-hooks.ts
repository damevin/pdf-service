#!/usr/bin/env node
// Run tests in "test" mode (this is not done by mocha).
process.env.NODE_ENV = "test";

import { fastify, FastifyInstance } from "fastify";
import { setupApp } from "../../src/app";
import { fastifyOptions } from "$boot/options";

/** The testable Fastify instance. */
export let app: FastifyInstance;

export const mochaHooks = {
  /**
   * Setup the Fastify instance.
   * Always run this function before tests run.
   */
  async beforeAll(): Promise<void> {
    // Fastify server setup
    app = setupApp(fastify(fastifyOptions));
    await app.ready();
  },

  /**
   * Stop the Fastify instance.
   */
  async afterAll(): Promise<void> {
    await app?.close();
  },
};
