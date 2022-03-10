import { Readable } from "stream";
import { performance } from "perf_hooks";
import { Context } from "./pre-handlers/helpers";
import { Wkhtmltopdf } from "./wkhtmltopdf.service";

// Instantiate a new converter with default options.
const converter = new Wkhtmltopdf();

const monitor = (ctx: Context, stream: NodeJS.ReadableStream): void => {
  const t1 = performance.now();
  let bytes = 0;
  stream.on("data", (chunk) => {
    bytes += chunk.byteLength;
  });
  stream.on("end", () => {
    const t2 = performance.now();
    const ms = Math.round(100 * (t2 - t1)) / 100;
    ctx.log.info({ time: ms, size: bytes }, "Generated a PDF in %d ms (%d bytes)", ms, bytes);
  });
  stream.on("error", (err) => ctx.log.error({ err }, "Failed to generate a PDF"));
};

export const convert = (ctx: Context, input: Readable): Readable => {
  // Generate the PDF
  const stream = converter.pdf(ctx, input, {
    pageSize: "A4",
    disableJavascript: true,
    javascriptDelay: 0,
    allow: "fonts",
    disableLocalFileAccess: true,
  });

  // Performance monitoring
  monitor(ctx, stream);
  return stream;
};
