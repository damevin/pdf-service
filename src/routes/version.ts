import { NowRequestHandler } from "fastify-now";
import pkg from "../../package.json";

// No type generics <{  }> since this route expects no input
export const GET: NowRequestHandler = async (req) => {
  req.log.debug({ version: pkg.version }, "Received /version request");
  return pkg.version;
};

GET.opts = {
  schema: {
    summary: "Replies with the current API version.",
    description: "This is a basic GET route that tells which version is currently running.",
    produces: ["text/plain"],
    response: {
      200: { type: "string" },
    },
  },
};
