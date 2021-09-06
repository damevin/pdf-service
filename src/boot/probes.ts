#!/usr/bin/env node
import type { FastifyInstance } from "fastify";
import gracefulShutdown from "http-graceful-shutdown";
import fastifyMetrics from "fastify-metrics";
import { env } from "./environment";
import { disconnect } from "mongoose";

/** Handle graceful start and graceful shutdown for PM2, K8S, etc. */
export const addProbes = (server: FastifyInstance): void => {
  // Intercept SIGINT and SIGTERM signals (except in devevelop)
  const manualShutdown = gracefulShutdown(server.server, {
    development: env.isDevelopment,
    onShutdown: async (signal) => {
      server.log.info("Shutting down server after receiving %s signal", signal);
      await disconnect();
    },
  });

  // Process signal for PM2 graceful start
  server.addHook("onReady", async () => {
    process.send?.("ready");
  });

  // PM2 graceful stop on Windows
  process.on("message", (msg) => {
    if (msg === "shutdown") {
      manualShutdown();
    }
  });

  // Ready endpoint for K8S probes (live is defined in ./security.ts)
  server.get("/ready", (_req, rep) => {
    rep.send({ ready: true });
  });

  // Metrics for Prometheus
  server.register(fastifyMetrics, {
    endpoint: "/metrics",
  });
};
