#!/usr/bin/env node
import { Wkhtmltopdf } from "$services/wkhtmltopdf.service";
import { FastifyLoggerInstance } from "fastify";

// Instantiate a new converter with default options.
export const converter = new Wkhtmltopdf();

/**
 * Prepare access to fonts.
 * Returns a callback to run on exit.
 */
export const setupWkhtmltopdf = (logger: FastifyLoggerInstance) => {
  return () => {
    converter.destroy(logger);
  };
};
