import { NowRequestHandler } from "fastify-now";
import pkg from "../../package.json";

export const GET: NowRequestHandler<{ Body: string }> = async (req) => {
  req.log.debug({ version: pkg.version }, "Received /version request");
  return pkg.version;
};

GET.opts = {
  schema: {
    summary: "Replies with the current API version.",
    description:
      "This API is versioned following [Calendar Versioning](https://calver.org/), in the `YY.MINOR.PATCH` format. This is a basic GET route that tells which version is currently running.",
    produces: ["text/plain"],
    response: {
      200: { type: "string" },
    },
  },
};
