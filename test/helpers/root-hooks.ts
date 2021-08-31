#!/usr/bin/env node
// Run tests in "test" mode (this is not done by mocha).
process.env.NODE_ENV = "test";

import { fastify, FastifyInstance } from "fastify";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { connect, disconnect } from "mongoose";
import { setupApp } from "../../src/app";
import { fastifyOptions } from "$boot/options";

/** The testable Fastify instance. */
export let app: FastifyInstance;
/** The MongoDB server. It should not be accessed directly during tests. */
let mongod: MongoMemoryServer;

export const mochaHooks = {
  /**
   * Setup the Fastify instance and the in-memory MongoDB database.
   * Always run this function before tests run.
   */
  async beforeAll(): Promise<void> {
    // Fastify server setup
    app = setupApp(fastify(fastifyOptions));
    await app.ready();

    // Database connection
    mongod = await MongoMemoryServer.create({
      instance: {
        port: Number(process.env.MONGODB_MEMORY_PORT) || undefined,
      },
    });
    await connect(mongod.getUri());
  },

  /**
   * Stop the in-memory MongoDB database.
   */
  async afterAll(): Promise<void> {
    await app?.close();
    await disconnect();
    await mongod?.stop();
  },
};
