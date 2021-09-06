import { Unauthorized } from "$errors/auth.errors";
import { ProfileAlreadyExists, ProfileNotFound } from "$errors/profiles.errors";
import {
  GetProfile,
  GET_PROFILE,
  ProfileBody,
  PROFILE_BODY,
  PROFILE_RESPONSE,
} from "$schemas/profiles.schemas";
import { ERROR_SCHEMA } from "$schemas/utils";
import { authUser } from "$services/pre-handlers/auth.service";
import { checkProfile, findProfile, updateProfile } from "$services/profile.service";
import { NowRequestHandler } from "fastify-now";

interface Get
  extends NowRequestHandler<{
    Params: GetProfile;
  }> {}

interface Put
  extends NowRequestHandler<{
    Params: GetProfile;
    Body: Partial<ProfileBody>;
  }> {}

export const GET: Get = async (request) => {
  const ctx = request.getContext();
  const profile = await findProfile(ctx, request.params.username);
  if (!profile) {
    throw new ProfileNotFound();
  }
  return { profile };
};

GET.opts = {
  schema: {
    // Swagger documentation
    summary: "Get a profile",
    description: "Get a profile of a user of the system.",
    tags: ["Profile"],
    operationId: "GetProfileByUsername",
    // Input validation (also used by Swagger)
    params: GET_PROFILE,
    // Output validation (also used by Swagger)
    response: {
      200: PROFILE_RESPONSE,
      400: ERROR_SCHEMA,
      404: ERROR_SCHEMA,
    },
  },
};

export const PUT: Put = async (request, response) => {
  const ctx = request.getContextAuth();
  const { params, body } = request;
  if (params.username !== ctx.user.username) {
    throw new Unauthorized();
  }
  if (body.username && body.username !== params.username) {
    const available = !(await checkProfile(ctx, body.username));
    if (!available) {
      throw new ProfileAlreadyExists();
    }
  }
  await updateProfile(ctx, params.username, body);
  response.code(204);
};

PUT.opts = {
  // Middlewares
  preHandler: [authUser],
  schema: {
    // Swagger documentation
    summary: "Update a profile",
    description: "Update an existing profile with new information.",
    tags: ["Profile"],
    operationId: "UpdateProfile",
    // Input validation (also used by Swagger)
    params: GET_PROFILE,
    body: PROFILE_BODY,
    // Output validation (also used by Swagger)
    response: {
      204: {
        description: "Profile updated.",
        type: "null",
      },
      400: ERROR_SCHEMA,
      409: ERROR_SCHEMA,
    },
  },
};
