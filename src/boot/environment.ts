#!/usr/bin/env node
import isDocker from "is-docker";
import { config } from "dotenv";
import { accessorMiddleware, customCleanEnv, port, str } from "envalid";

// Load environment variables from a .env file
config();

/** Expose clean environment variables that should be set, typed and valid */
export const env = customCleanEnv(
  process.env as unknown,
  {
    // Server settings
    LOG_LEVEL: str({
      choices: ["info", "error", "debug", "fatal", "warn", "trace"],
      default: "info",
    }),
    NODE_ENV: str({
      choices: ["development", "test", "production", "staging"],
    }),
    HOST: str({ default: isDocker() ? "0.0.0.0" : "127.0.0.1" }),
    PORT: port({ default: 4010 }),
  },
  accessorMiddleware
);
