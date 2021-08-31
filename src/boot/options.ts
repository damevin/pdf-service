import type { PrettyOptions } from "fastify/types/logger";
import type { FastifyServerOptions } from "fastify";
import { env } from "./environment";

// Logger options for DEV or TEST environments
const prettyPrint: PrettyOptions = {
  ignore: "pid,hostname",
  translateTime: "SYS:HH:MM:ss.l",
};

// Additional options for data validation
// Plugins like ajv-errors are broken until Fastify ships with AJV v8
const ajvOptions: FastifyServerOptions["ajv"] = {
  customOptions: {
    coerceTypes: "array",
  },
  plugins: [],
};

// Options for the Fastify instance
export const fastifyOptions: FastifyServerOptions = {
  ajv: ajvOptions,
  logger: {
    level: env.LOG_LEVEL,
    prettyPrint: env.isDev || env.isTest ? prettyPrint : false,
  },
  trustProxy: ["127.0.0.1"],
};
