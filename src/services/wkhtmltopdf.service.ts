import os from "os";
import { paramCase } from "param-case";
import { ChildProcessWithoutNullStreams as CPWNS, spawn } from "child_process";
import { Context } from "./pre-handlers/helpers";
import { Readable } from "stream";

/*
 * Portions of this code are based on MIT licensed code from:
 * - https://github.com/devongovett/node-wkhtmltopdf
 * - https://github.com/tcort/wkhtmltox
 */

/**
 * Option to initialize the service.
 */
interface WkhtmltopdfOptions {
  interval: number;
  maxWorkers: number;
  binary: string;
}

/**
 * Options directly sent to `wkhtmltopdf`.
 * See more options: https://wkhtmltopdf.org/usage/wkhtmltopdf.txt
 */
interface HtmlToPdfOptions {
  collate?: boolean;
  noCollate?: boolean;
  dpi?: number;
  grayscale?: boolean;
  imageDpi?: number;
  imageQuality?: number;
  lowquality?: boolean;

  "margin-bottom"?: number;
  "margin-left"?: number;
  "margin-right"?: number;
  "margin-top"?: number;

  /** Add a default header, with the name of the page to the left, and the page number to the right. */
  defaultHeader?: boolean;

  /** Page orientation. Defaults to Landscape. */
  orientation?: "Landscape" | "Portrait";
  /** Page size. Defaults to A4. See full list: https://doc.qt.io/archives/qt-4.8/qprinter.html#PaperSize-enum */
  pageSize?: string | "A4" | "Letter";
  /** Disable JavaScript (recommended). */
  disableJavascript?: boolean;
  /** Do not make links to remote pages. */
  disableExternalLinks?: boolean;
  /** Turn HTML form fields into PDF form fields. */
  enableForms?: boolean;
  /** Use "print" media type instead of "screen". */
  printMediaType?: boolean;
  /** Link from section header to toc. */
  enableTocBackLinks?: boolean;
  /** Time to wait for JS to run, in milliseconds. Default is 200. */
  javascriptDelay?: number;
  /** Disallow the converter to access local files. */
  disableLocalFileAccess?: boolean;
  /** A local file or directory that the converter is allowed to read. */
  allow?: string;
}

const filterInPlace = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] => {
  let j = 0;

  for (const [i, e] of array.entries()) {
    if (predicate(e, i, array)) {
      // eslint-disable-next-line security/detect-object-injection
      if (i !== j) array[j] = e;
      j++;
    }
  }

  array.length = j;
  return array;
};

const between = (x: number | undefined, min: number, max: number, fallback: number) => {
  return typeof x === "number" && x >= min && x <= max ? x : fallback;
};

export class Wkhtmltopdf {
  private interval: number;
  private maxWorkers: number;
  private binary: string;
  private workers: CPWNS[] = [];
  private running: CPWNS[] = [];

  constructor(opts?: Partial<WkhtmltopdfOptions>) {
    this.interval = between(opts?.interval, 100, 60_000, 5000);
    this.maxWorkers = between(opts?.maxWorkers, 0, 32, os.cpus().length);
    this.binary = opts?.binary ?? "wkhtmltopdf";

    // Start periodic check of worker pool
    if (this.maxWorkers > 0) {
      process.nextTick(() => this.workerMonitor());
    }

    process.on("exit", () => {
      this.destroy();
    });
  }

  // HTML to PDF
  pdf(ctx: Context, inputStream: NodeJS.ReadableStream, options: HtmlToPdfOptions): Readable {
    // Take a worker from the pool or launch a new one
    const worker = this.workers.shift() ?? this.launchWorker();
    this.running.push(worker);

    // Add listeners
    worker.stdin.once("error", function (err) {
      ctx.log.error({ err }, "wkhtmltopdf worker input stream error");
      if (worker.exitCode === null) {
        worker.kill();
      }
    });
    worker.stderr.on("data", (chunk) => {
      const str = String(chunk as Buffer)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => !/[=>[\]]/.test(line))
        .filter(Boolean)
        .join("\n");
      if (str) {
        ctx.log.info("WORKER: " + str);
      }
    });

    // Send the program the arguments and the input
    const flags = this.prepareArguments(options);
    worker.stdin.write([...flags, "-", "-"].join(" ") + "\n");
    inputStream.pipe(worker.stdin);

    // Return the output stream to the caller
    return worker.stdout;
  }

  private prepareArguments(options: HtmlToPdfOptions): string[] {
    // Initial command line arguments
    const args: string[] = [];

    for (const [key, value] of Object.entries(options)) {
      // Transform 'someFlag' into '--some-flag'
      const flag = key.length === 1 ? `-${key}` : `--${paramCase(key)}`;

      // Push all flags except boolean flags that are false
      if (value !== false) {
        args.push(flag);
      }

      // Add the values for flags with arguments
      if (typeof value === "string") {
        args.push(JSON.stringify(value)); // quote the value
      } else if (typeof value !== "boolean") {
        args.push(value);
      }
    }
    return args;
  }

  destroy() {
    // Prevent new workers from being spawned, then kill all existing workers
    this.maxWorkers = 0;
    console.log("Shutting down", this.workers.length + this.running.length, "workers");
    while (this.workers.length > 0 || this.running.length > 0) {
      const worker = this.workers.shift() ?? this.running.shift();
      if (worker && worker.exitCode === null) {
        worker.kill();
      }
    }
  }

  // Preload a worker process, that will have wkhtmltopdf loaded, initialized and ready for input
  private launchWorker() {
    if (os.platform() === "win32") {
      // /bin/sh doesn't exist on Windows, invoke wkhtmltopdf directly
      return spawn(this.binary, [/* "--quiet", */ "--read-args-from-stdin"], {
        env: { ...process.env },
        cwd: process.cwd(),
        shell: false,
      });
    }
    // using `sh -c ${cmd} | cat` construction because of an issue with stdin/stdout on Linux.
    return spawn("/bin/sh", ["-c", `${this.binary} --quiet --read-args-from-stdin | cat`], {
      env: { ...process.env },
      cwd: process.cwd(),
      shell: false,
    });
  }

  // Function that runs every interval
  private workerMonitor() {
    // Check to see that there are enough workers
    while (this.workers.length < this.maxWorkers) {
      this.workers.push(this.launchWorker());
    }

    // Clean up exited workers
    for (const worker of this.running) {
      if (worker.stdin.destroyed && worker.exitCode === null) {
        worker.kill();
      }
    }
    filterInPlace(this.running, (worker) => worker.exitCode === null);

    setTimeout(() => {
      this.workerMonitor();
    }, this.interval);
  }
}
