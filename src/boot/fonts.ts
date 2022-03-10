#!/usr/bin/env node
import { FastifyLoggerInstance } from "fastify";
import { unlinkSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { sync } from "symlink-or-copy";

export const fontsDir = resolve(tmpdir(), "fonts");

/**
 * Prepare access to fonts.
 * Returns a callback to run on exit.
 */
export const setupFonts = (log: FastifyLoggerInstance) => {
  const target = resolve("fonts");
  sync(target, fontsDir);

  return () => {
    log.info("Cleaning up fonts...");
    unlinkSync(fontsDir);
  }
};
