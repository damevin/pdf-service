import { ProfileAlreadyExists } from "$errors/profiles.errors";
import { ProfileBody, PROFILE_BODY, PROFILE_RESPONSE } from "$schemas/profiles.schemas";
import { ERROR_SCHEMA } from "$schemas/utils";
import { checkProfile, createProfile } from "$services/profile.service";
import { NowRequestHandler } from "fastify-now";

interface Post
  extends NowRequestHandler<{
    Body: ProfileBody;
  }> {}

export const POST: Post = async (request) => {
  const ctx = request.getContext();
  const exists = await checkProfile(ctx, request.body.username);
  if (exists) {
    throw new ProfileAlreadyExists();
  }
  const profile = await createProfile(ctx, request.body);
  return { profile };
};

POST.opts = {
  schema: {
    // Swagger documentation
    summary: "Create a profile",
    description: "Create a new profile.",
    tags: ["Profile"],
    operationId: "CreateProfile",
    // Input validation (also used by Swagger)
    body: PROFILE_BODY,
    // Output validation (also used by Swagger)
    response: {
      200: PROFILE_RESPONSE,
      400: ERROR_SCHEMA,
      409: ERROR_SCHEMA,
    },
  },
};
