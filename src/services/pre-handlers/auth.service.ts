import type { preHandlerAsyncHookHandler } from "fastify";
import { Types } from "mongoose";
import { Profile, Profiles } from "$models/profile.model";
import { MalformedAuthHeader, MissingAuthHeader, UserNotFound } from "$errors/auth.errors";

/** Middleware to fetch the currently signed-in user. */
export const authUser: preHandlerAsyncHookHandler = async (req) => {
  // Not possible to test directly a middleware that expects a request,
  // so the middleware wraps a function that can be tested.
  req.user = await getUser(req.headers["authorization"]);
};

/** Service to fetch the currently signed-in user. */
export const getUser = async (authorization?: string): Promise<Profile> => {
  // Check the Authorization header
  if (!authorization?.length) {
    throw new MissingAuthHeader();
  }
  const idString = authorization.slice(7);
  if (!authorization.toLowerCase().startsWith("bearer ") || !Types.ObjectId.isValid(idString)) {
    throw new MalformedAuthHeader();
  }

  // Fetch user
  const id = new Types.ObjectId(idString);
  const user = await Profiles.findById(id);
  if (!user) {
    throw new UserNotFound();
  }
  return user;
};

// Support adding the user to the request
declare module "fastify" {
  export interface FastifyRequest {
    user?: Profile;
  }
}
