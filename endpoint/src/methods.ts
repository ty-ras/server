export type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "TRACE";

export type HttpMethodWithoutBody = keyof typeof HttpMethodsWithoutBody;
export type HttpMethodWithBody = Exclude<HttpMethod, HttpMethodWithoutBody>;

export const isMethodWithoutRequestBody = (
  method: HttpMethod,
): method is HttpMethodWithoutBody => method in HttpMethodsWithoutBody;
const HttpMethodsWithoutBody = {
  TRACE: true,
  GET: true,
  OPTIONS: true,
  HEAD: true,
} as const;
