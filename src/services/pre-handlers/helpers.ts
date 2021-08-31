import { Profile } from "$models/profile.model";
import { FastifyLoggerInstance } from "fastify";

export interface Context {
  log: FastifyLoggerInstance;
}

export interface ContextAuth extends Context {
  user: Profile;
}
