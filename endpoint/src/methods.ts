export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS"; // And others...

export const HttpMethodsWithoutBody = {
  GET: true,
  OPTIONS: true,
} as const;

export type HttpMethodWithoutBody = keyof typeof HttpMethodsWithoutBody;
export type HttpMethodWithBody = Exclude<HttpMethod, HttpMethodWithoutBody>;

export const isMethodWithoutBody = (
  method: HttpMethod,
): method is HttpMethodWithoutBody => method in HttpMethodsWithoutBody;
