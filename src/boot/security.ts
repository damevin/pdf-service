#!/usr/bin/env node
import type { FastifyInstance } from "fastify";
import cors from "fastify-cors";
import helmet from "fastify-helmet";
import rateLimit from "fastify-rate-limit";
import underPressure, {
  TYPE_EVENT_LOOP_DELAY,
  TYPE_EVENT_LOOP_UTILIZATION,
  TYPE_HEALTH_CHECK,
  TYPE_HEAP_USED_BYTES,
  TYPE_RSS_BYTES,
} from "under-pressure";

/** Log function called when the server load exceeds configured thresholds. */
const logPressure = (server: FastifyInstance, type: string, value: number | undefined) => {
  switch (type) {
    case TYPE_EVENT_LOOP_DELAY:
      server.log.warn({ value }, "event loop too delayed");
      break;
    case TYPE_HEAP_USED_BYTES:
      server.log.warn({ value }, "too many heap bytes used");
      break;
    case TYPE_RSS_BYTES:
      server.log.warn({ value }, "too many rss bytes used");
      break;
    case TYPE_HEALTH_CHECK:
      server.log.warn({ value }, "health check failed");
      break;
    case TYPE_EVENT_LOOP_UTILIZATION:
      server.log.warn({ value }, "event loop too busy");
      break;
    default:
      server.log.error({ value }, "unexpected error type: %s", type);
  }
};

/** Decorate the given Fastify instance with security plugins. */
export const addSecurity = (server: FastifyInstance): void => {
  server.register(helmet);
  server.register(cors);
  // Allow 60 requests per minute per IP by default
  server.register(rateLimit, {
    cache: 20_000,
    max: 60,
    timeWindow: "1 minute",
  });

  server.register(underPressure, {
    // Live endpoint for K8S probes (ready is defined in ./probes.ts)
    exposeStatusRoute: {
      url: "/live",
      routeOpts: {},
      routeResponseSchemaOpts: {
        uptime: { type: "number" },
      },
    },
    /** Function called to check the system is still live. */
    healthCheck: async () => {
      // TODO check database connection
      return { uptime: Math.trunc(process.uptime()) };
    },
    maxEventLoopDelay: 250,
    maxEventLoopUtilization: 0.97,
    // maxHeapUsedBytes: 100_000_000,
    // maxRssBytes: 100_000_000,
    pressureHandler: (_req, _rep, type, value) => {
      logPressure(server, type, value);
    },
  });
};
