/**
 * @file This file contains code related to handling HTTP server CORS functionality using {@link evt.EventHandler}.
 */
import type * as data from "@ty-ras/data";
import type * as evt from "./events.types";
import type * as flow from "./flow";

/**
 * Creates new {@link evt.EventHandler} which behaves in relation to CORS as configured via parameters.
 * This function should be used by other TyRAS libraries, and not by client code directly.
 * @param param0 The {@link CORSFlowCallbacks}.
 * @param param0.getMethod Privately deconstructed variable.
 * @param options The {@link CORSOptions}.
 * @param proceed The optional callback used to dynamically disable/enable the CORS handler.
 * @returns The CORS handler as {@link evt.EventHandler}.
 */
export const createCORSHandlerGeneric = <TContext extends flow.TContextBase>(
  { getMethod, ...callbacks }: CORSFlowCallbacks<TContext>,
  options: CORSOptions,
  proceed?: evt.EventHandler<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evt.VirtualRequestProcessingEvents<flow.GetContext<TContext>, any>,
    boolean
  >,
): evt.EventHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evt.VirtualRequestProcessingEvents<flow.GetContext<TContext>, any>,
  boolean
> => {
  const headerSetter = createHeaderSetterCallback(callbacks, options);
  return (eventName, eventData) => {
    // We could do: proceed?.(...) ?? true
    // However, if proceed would return undefined (for one reason or another), then we would evaluate to proceed, which might be misleading.
    let modified = proceed ? proceed(eventName, eventData) : true;
    if (modified) {
      const { ctx, ...evtData } = eventData;
      switch (eventName) {
        case "onInvalidMethod":
          {
            const allowedMethods =
              getMethod(ctx) === "OPTIONS"
                ? (
                    evtData as unknown as evt.VirtualRequestProcessingEvents<
                      never,
                      never
                    >["onInvalidMethod"]
                  ).allowedMethodsSentToClient
                : undefined;
            headerSetter(
              ctx,
              allowedMethods && allowedMethods.length > 0
                ? allowedMethods
                : undefined,
            );
          }
          break;
        case "onSuccessfulInvocationEnd":
        case "onInvalidUrl":
        case "onInvalidUrlParameters":
        case "onInvalidState":
        case "onInvalidQuery":
        case "onInvalidRequestHeaders":
        case "onInvalidContentType":
        case "onInvalidBody":
        case "onInvalidResponse":
        case "onException":
          headerSetter(ctx, undefined);
          break;
        default:
          modified = false;
      }
    }
    return modified;
  };
};

/**
 * The CORS options, as accepted by {@link createCORSHandlerGeneric}.
 */
export interface CORSOptions {
  /**
   * This property is only used for preflight-requests.
   * Allows to statically or dynamically specify the value for `Access-Control-Allow-Methods` header returned with response to preflight-request.
   */
  allowMethods?:
    | true
    | ReadonlyMaybeArrayData<data.HttpMethod>
    | CallbackWithRequestHeader<MaybeArrayData>;

  /**
   * This property is only used for preflight-requests.
   * Allows to statically or dynamically specify the the value for `Access-Control-Allow-Headers` header returned with response to preflight-request.
   */
  allowHeaders?:
    | ReadonlyMaybeArrayData
    | CallbackWithRequestHeader<MaybeArrayData>;

  /**
   * This property is used for both preflight-, as well as normal requests.
   * Allows to statically or dynamically specify the value for `Access-Control-Allow-Origin` header of the response.
   */
  allowOrigin: string | CallbackWithRequestHeader<string>;

  /**
   * This property is used for both preflight-, as well as normal requests.
   * Allows to statically specify the value for `Access-Control-Expose-Headers` header of the response.
   */
  exposeHeaders?: ReadonlyMaybeArrayData;

  /**
   * This property is used for both preflight-, as well as normal requests.
   * Allows to statically specify the value for `Access-Control-Max-Age` header of the response.
   */
  maxAge?: number;

  /**
   * This property is used for both preflight-, as well as normal requests.
   * Allows to statically specify the value for `Access-Control-Allow-Credentials` header of the response.
   */
  allowCredentials?: boolean;
}

/**
 * This type specifies the callbacks from {@link flow.ServerFlowCallbacks} which are required for operation of {@link createCORSHandlerGeneric}.
 */
export type CORSFlowCallbacks<TContext> = Pick<
  flow.ServerFlowCallbacks<TContext, never>,
  "getMethod" | "getHeader" | "setHeader" | "setStatusCode"
>;

/**
 * The helper type to specify one or more strings.
 */
export type MaybeArrayData = data.OneOrMany<string>;
/**
 * The helper type to specify one or more strings as `readonly`.
 */
export type ReadonlyMaybeArrayData<TData = string> =
  | TData
  | ReadonlyArray<TData>;

/**
 * The callback type for dynamically calculatable values of {@link CORSOptions}.
 */
export type CallbackWithRequestHeader<T> = (
  requestHeaderValue: data.ReadonlyHeaderValue,
  getHeader: GetHeaderFromRequest,
) => T;

/**
 * The type of 2nd parameter of {@link CallbackWithRequestHeader}.
 */
export type GetHeaderFromRequest = (
  headerName: string,
) => data.ReadonlyHeaderValue;

const createHeaderSetterCallback = <TContext>(
  {
    getHeader,
    setHeader,
    setStatusCode,
  }: Omit<CORSFlowCallbacks<TContext>, "getMethod">,
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
      ? (ctx: flow.GetContext<TContext>) =>
          setHeader(ctx, "Access-Control-Allow-Origin", allowOrigin)
      : (ctx: flow.GetContext<TContext>) => (
          setHeader(
            ctx,
            "Access-Control-Allow-Origin",
            allowOrigin(getHeader(ctx, "origin"), (hdrName) =>
              getHeader(ctx, hdrName),
            ),
          ),
          setHeader(ctx, "Vary", "Origin")
        );
  return (
    ctx: flow.GetContext<TContext>,
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
          callWithHeaderFromRequest(
            v,
            (hdrName) => getHeader(ctx, hdrName),
            "Access-Control-Request-Headers",
          ),
      );
      setHeaderIfNeeded(
        setHeader,
        ctx,
        "Access-Control-Allow-Methods",
        allowMethodsValue,
        (v) =>
          v === true
            ? joinStringArrayIfNeeded(preflightAllowedMethods)
            : callWithHeaderFromRequest(
                v,
                (hdrName) => getHeader(ctx, hdrName),
                "Access-Control-Request-Method",
              ),
      );
      // Also set status code + notify server flow that it should skip setting status code.
      // Notice! The status code must be 200 (and not e.g. 204), because... Well, I have no idea why, but browsers don't like that.
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

const callWithHeaderFromRequest = (
  callback: string | CallbackWithRequestHeader<MaybeArrayData>,
  getHeader: (headerName: string) => data.ReadonlyHeaderValue,
  requestHeaderName: string,
) =>
  typeof callback === "function"
    ? callback(getHeader(requestHeaderName), getHeader)
    : callback;
