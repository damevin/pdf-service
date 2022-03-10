#!/usr/bin/env node
import fastify from "fastify";
import { env } from "$boot/environment";
import { addProbes } from "$boot/probes";
import { addSecurity } from "$boot/security";
import { addSwagger } from "$boot/swagger";
import { fastifyOptions } from "$boot/options";
import { setupApp } from "./app";
import { setupFonts } from "$boot/fonts";
import { setupWkhtmltopdf } from "$boot/wkhtmltopdf";

const start = () => {
  const server = fastify(fastifyOptions);
  addSwagger(server);
  setupApp(server);
  server.log.info(`Starting server...`);

  // Add plugins
  const cleanupFonts = setupFonts(server.log);
  const cleanupWorkers = setupWkhtmltopdf(server.log);
  addSecurity(server);
  addProbes(server, [cleanupWorkers, cleanupFonts]);

  // Start the server
  server.listen(env.PORT, env.HOST, (error) => {
    if (error) {
      server.log.error({ error }, "Unable to start the server");
      process.exit(1);
    }
  });
};
start();
