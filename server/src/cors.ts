import type * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";
import type * as evt from "./events";
import type * as flow from "./flow";

export const createCORSHandler = <
  TContext extends Pick<flow.TContextBase, "skipSettingStatusCode">,
>(
  {
    getMethod,
    ...callbacks
  }: Pick<
    flow.ServerFlowCallbacks<TContext, never>,
    "getMethod" | "getHeader" | "setHeader" | "setStatusCode"
  >,
  options: CORSOptions,
): evt.EventEmitter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evt.VirtualRequestProcessingEvents<TContext, any>,
  boolean
> => {
  const headerSetter = createHeaderSetterCallback(callbacks, options);
  return (eventName, { ctx, ...evtData }) => {
    let modified = true;
    switch (eventName) {
      case "onInvalidMethod":
        headerSetter(
          ctx,
          getMethod(ctx) === "OPTIONS"
            ? (
                evtData as unknown as evt.VirtualRequestProcessingEvents<
                  never,
                  never
                >["onInvalidMethod"]
              ).allowedMethods
            : undefined,
        );
        break;
      case "onSuccessfulInvocationEnd":
      case "onInvalidUrl":
      case "onInvalidUrlParameters":
      case "onInvalidState":
      case "onInvalidQuery":
      case "onInvalidRequestHeaders":
      case "onInvalidContentType":
      case "onInvalidBody":
      case "onException":
        headerSetter(ctx, undefined);
        break;
      default:
        modified = false;
    }
    return modified;
  };
};

export interface CORSOptions {
  allowOrigin: string | ((origin: data.ReadonlyHeaderValue) => string);
  allowMethods?: true | ReadonlyMaybeArrayData<ep.HttpMethod>;
  allowHeaders?:
    | ReadonlyMaybeArrayData
    | ((requestedHeaders: data.ReadonlyHeaderValue) => MaybeArrayData);
  exposeHeaders?: ReadonlyMaybeArrayData;
  maxAge?: number;
  allowCredentials?: boolean;
}

export type SeenOrigin = string | undefined;
export type MaybeArrayData = data.OneOrMany<string>;
export type ReadonlyMaybeArrayData<TData = string> =
  | TData
  | ReadonlyArray<TData>;

const createHeaderSetterCallback = <
  TContext extends Pick<flow.TContextBase, "skipSettingStatusCode">,
>(
  {
    getHeader,
    setHeader,
    setStatusCode,
  }: Pick<
    flow.ServerFlowCallbacks<TContext, never>,
    "getHeader" | "setHeader" | "setStatusCode"
  >,
  {
    allowOrigin,
    allowMethods,
    allowHeaders,
    exposeHeaders,
    allowCredentials,
    maxAge,
  }: CORSOptions,
) => {
  const allowHeadersValue = joinStringArrayIfNeeded(allowHeaders);
  const allowMethodsValue = joinStringArrayIfNeeded(allowMethods);
  const exposeHeadersValue = joinStringArrayIfNeeded(exposeHeaders);
  const allowCredentialsValue = getStringValueIfNeeded(allowCredentials);
  const maxAgeValue = getStringValueIfNeeded(maxAge);
  const originSetter =
    typeof allowOrigin === "string"
      ? (ctx: TContext) =>
          setHeader(ctx, "Access-Control-Allow-Origin", allowOrigin)
      : (ctx: TContext) => (
          setHeader(
            ctx,
            "Access-Control-Allow-Origin",
            allowOrigin(getHeader(ctx, "origin")),
          ),
          setHeader(ctx, "Vary", "Origin")
        );
  return (
    ctx: TContext,
    preflightAllowedMethods: ReadonlyArray<string> | undefined,
  ) => {
    // Set the origin header (and Vary if needed)
    originSetter(ctx);
    // Set expose headers
    setHeaderIfNeeded(
      setHeader,
      ctx,
      "Access-Control-Expose-Headers",
      exposeHeadersValue,
    );
    // Set creds headers
    setHeaderIfNeeded(
      setHeader,
      ctx,
      "Access-Control-Allow-Credentials",
      allowCredentialsValue,
    );
    // Set max age header
    setHeaderIfNeeded(setHeader, ctx, "Access-Control-Max-Age", maxAgeValue);
    // Check if we are doing preflight request
    if (preflightAllowedMethods !== undefined) {
      // In case of preflight, set allow headers + allow methods
      setHeaderIfNeeded(
        setHeader,
        ctx,
        "Access-Control-Allow-Headers",
        allowHeadersValue,
        (v) =>
          typeof v === "function"
            ? v(getHeader(ctx, "Access-Control-Request-Headers"))
            : v,
      );
      setHeaderIfNeeded(
        setHeader,
        ctx,
        "Access-Control-Allow-Methods",
        allowMethodsValue,
        (v) => (v === true ? [...preflightAllowedMethods] : v),
      );
      // Also set status code + notify server flow that it should skip setting status code.
      setStatusCode(ctx, 200, false);
      ctx.skipSettingStatusCode = true;
    }
  };
};

const joinStringArrayIfNeeded = <T>(
  value: T,
): Exclude<T, ReadonlyMaybeArrayData> | string => {
  return Array.isArray(value)
    ? value.join(",")
    : (value as Exclude<T, ReadonlyMaybeArrayData>);
};

const getStringValueIfNeeded = <T>(value: T): string | undefined =>
  value === undefined ? undefined : `${value}`;

function setHeaderIfNeeded<TContext>(
  setHeader: flow.ServerFlowCallbacks<TContext, never>["setHeader"],
  context: TContext,
  headerName: string,
  value: string | undefined,
): void;
function setHeaderIfNeeded<TContext, TValue>(
  setHeader: flow.ServerFlowCallbacks<TContext, never>["setHeader"],
  context: TContext,
  headerName: string,
  value: TValue,
  getHeaderValue: (
    value: Exclude<TValue, undefined>,
  ) => Exclude<data.HeaderValue, undefined>,
): void;
function setHeaderIfNeeded<TContext, TValue>(
  setHeader: flow.ServerFlowCallbacks<TContext, never>["setHeader"],
  context: TContext,
  headerName: string,
  value: TValue,
  getHeaderValue?: (
    value: Exclude<TValue, undefined>,
  ) => Exclude<data.HeaderValue, undefined>,
): void {
  if (value !== undefined) {
    setHeader(
      context,
      headerName,
      getHeaderValue
        ? getHeaderValue(value as Exclude<TValue, undefined>)
        : (value as unknown as Exclude<data.HeaderValue, undefined>),
    );
  }
}
