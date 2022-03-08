import { FastifyLoggerInstance } from "fastify";

export interface Context {
  log: FastifyLoggerInstance;
}
