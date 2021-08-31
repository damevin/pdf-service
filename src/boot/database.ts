#!/usr/bin/env node
import type { FastifyInstance } from "fastify";
import { connect, connection } from "mongoose";
import { URL } from "url";
import { config } from "dotenv";
import { accessorMiddleware, customCleanEnv, str } from "envalid";

// Load environment variables from a .env file
config();

/** Expose clean environment variables that should be set, typed and valid */
export const dbConf = customCleanEnv(
  process.env as unknown,
  {
    MONGODB_HOST: str({ devDefault: "localhost" }),
    MONGODB_USER: str({ default: "" }),
    MONGODB_PASS: str({ default: "" }),
    MONGODB_NAME: str(),
    MONGODB_SECURE: str({ choices: ["tls", "self-signed", "off"] }),
  },
  accessorMiddleware
);

/** Manage connection to the MongoDB database */
export const setupDatabase = (server: FastifyInstance): void => {
  const appName = server.app.name;
  const dbName = dbConf.MONGODB_NAME;
  const username = dbConf.MONGODB_USER;
  const password = dbConf.MONGODB_PASS;
  const secure = dbConf.MONGODB_SECURE;
  const uri = new URL(dbName, "mongodb://" + dbConf.MONGODB_HOST);

  server.log.info({ dbName }, "Connecting to the database");
  try {
    connect(uri.href, {
      appName,
      auth: username ? { username, password } : undefined,
      dbName,
      tls: secure !== "off",
      tlsInsecure: secure === "self-signed",
    });

    // Error
    connection.on("error", function (error) {
      server.log.error(error, "MongoDB error");
    });
    // Close
    connection.on("close", function () {
      server.log.info({ dbName }, "Connection closed");
    });
    // Connected
    connection.on("connected", function () {
      server.log.info({ dbName }, "Connection successful");
    });
    // Disconnected
    connection.on("disconnected", function () {
      server.log.info({ dbName }, "Disconnected");
    });
  } catch (error: unknown) {
    server.log.error(error);
  }
};
