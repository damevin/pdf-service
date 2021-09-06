import createError from "fastify-error";

export const ProfileNotFound = createError("PROFILE_NOT_FOUND", "The profile does not exist", 404);

export const ProfileAlreadyExists = createError(
  "PROFILE_EXISTS",
  "A profile with that name already exists",
  409
);
