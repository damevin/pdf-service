import createError from "fastify-error";

export const MissingAuthHeader = createError(
  "MISSING_HEADER_AUTHORIZATION",
  "Authorization header is missing",
  400
);

export const MalformedAuthHeader = createError(
  "BAD_HEADER_AUTHORIZATION",
  "Authorization header is malformed",
  400
);

export const UserNotFound = createError("USER_NOT_FOUND", "No known user matches the query", 404);

export const Unauthorized = createError(
  "UNAUTHORIZED",
  "You are not authorized to perform this action",
  401
);

export const NotSignedIn = createError(
  "NOT_SIGNED_IN",
  "This request has not been authenticated",
  401
);
