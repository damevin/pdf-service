import { ERROR_SCHEMA } from "$schemas/utils";
import { convert } from "$services/html-to-pdf.service";
import { NowRequestHandler } from "fastify-now";
import { IncomingMessage } from "http";

interface Post
  extends NowRequestHandler<{
    Body: IncomingMessage;
  }> {}

export const POST: Post = async (request, reply) => {
  const ctx = request.getContext();
  const stream = convert(ctx, request.body);
  reply.type("application/pdf");
  reply.send(stream);
};

POST.opts = {
  schema: {
    // Swagger documentation
    summary: "Convert HTML to PDF",
    description: "Generate a PDF document from the given HTML payload.",
    operationId: "GeneratePDF",
    // Input validation (also used by Swagger)
    // body: GENERATE_BODY,
    // Output validation (also used by Swagger)
    response: {
      400: ERROR_SCHEMA,
    },
  },
};
