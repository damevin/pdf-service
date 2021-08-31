#!/usr/bin/env node
import fastify from "fastify";
import { connection } from "mongoose";
import { setupDatabase } from "$boot/database";
import { env } from "$boot/environment";
import { addProbes } from "$boot/probes";
import { addSecurity } from "$boot/security";
import { addSwagger } from "$boot/swagger";
import { fastifyOptions } from "$boot/options";
import { setupApp } from "./app";

const start = () => {
  const server = fastify(fastifyOptions);
  addSwagger(server);
  setupApp(server);
  server.log.info(`Starting server...`);

  // Add plugins
  addSecurity(server);
  addProbes(server);

  // Wait for the database, then start the server
  connection.on("open", () => {
    server.listen(env.PORT, env.HOST, (error) => {
      if (error) {
        server.log.error({ error }, "Unable to start the server");
        process.exit(1);
      }
    });
  });
  setupDatabase(server);
};
start();
