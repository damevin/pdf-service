import { parse, relative } from "path";

/**
 * Get the route associated with the current test file.
 *
 * Usage:
 *
 * ```js
 * // __filename is defined by TypeScript
 * const url = getRoute(__filename);
 * const app = t.context.app;
 * const response = await app.inject({ method: "GET", url });
 * ```
 * @param filename The full path to the test file name.
 * @returns The associated route.
 */
export const getRoute = (filename: string): string => {
  const fullpath = relative("src/routes", filename);
  let { dir, name } = parse(fullpath);
  dir = dir.replace(/\\/g, "/");
  if (name.endsWith(".spec") || name.endsWith(".test")) {
    name = name.slice(0, -5);
  }
  if (name === "index") {
    name = "";
  }
  return `/${dir}/${name}`.replace("//", "/").replace(/\/$/, "");
};

interface RouteWithParams {
  /** The route URL without interpolation. */
  route: string;
  /** The list of parameter names for this route. */
  params: string[];
  /**
   * Build this route by interpolating the given parameters into the URL.
   * Example:
   *
   * ```js
   * const url = getRouteWithParams(__filename);
   * console.log(url.route); // /users/[groupId]/[userId]
   * console.log(url.build("ab")); // /users/ab/[name]
   * console.log(url.build("cd", "ef")); // /users/cd/ef
   * ```
   */
  build: (...params: unknown[]) => string;
  /**
   * Build this route by interpolating the given named parameters into the URL.
   * Example:
   *
   * ```js
   * const url = getRouteWithParams(__filename);
   * console.log(url.route); // /users/[groupId]/[userId]
   * console.log(url.named({ userId: "myUser" })); // /users/[groupId]/myUser
   * console.log(url.named({ userId: "myUser", groupId: "myGroup" })); // /users/myGroup/myUser
   * ```
   */
  named: (params: Record<string, unknown>) => string;
}

/**
 * Provide helpers to build the route associated with the current test file,
 * if this route has URL parameters like `[userId]`. It only works with
 * filenames using the \[square brackets\] syntax, and not the :column syntax.
 *
 * @param filename The full path to the test file name.
 * @returns An object with helpers to build the route name.
 */
export const getRouteWithParams = (filename: string): RouteWithParams => {
  // Properties
  const route = getRoute(filename);
  const params = route.match(/\[\w+]/g)?.map((match) => match.slice(1, -1)) ?? [];

  // Methods
  const build = (...params: unknown[]) =>
    // eslint-disable-next-line unicorn/no-array-reduce
    params.reduce<string>((path, param) => path.replace(/\[\w+]/, String(param)), route);
  const named = (params: Record<string, unknown>) =>
    // eslint-disable-next-line unicorn/no-array-reduce
    Object.entries(params).reduce(
      (path, [key, val]) => path.replace(`[${key}]`, String(val)),
      route
    );

  return { route, params, build, named };
};
