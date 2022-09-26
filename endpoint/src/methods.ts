export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS"; // And others...

export type HttpMethodWithoutBody = keyof typeof HttpMethodsWithoutBody;
export type HttpMethodWithBody = Exclude<HttpMethod, HttpMethodWithoutBody>;

export const isMethodWithoutRequestBody = (
  method: HttpMethod,
): method is HttpMethodWithoutBody => method in HttpMethodsWithoutBody;
const HttpMethodsWithoutBody = {
  GET: true,
  OPTIONS: true,
} as const;
