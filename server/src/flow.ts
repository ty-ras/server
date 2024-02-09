/**
 * @file This file contains code of the server flow, which goes through all the validation of all inputs and outputs of one endpoint handler for one incoming HTTP request.
 */

import type * as ep from "@ty-ras/endpoint";
import * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as server from "./utils";
import type * as evt from "./events.types";
import squashEndpoints from "./endpoint-squash";

import * as url from "node:url";
import * as stream from "node:stream";

/**
 * Creates a callback which will asynchronously process each incoming HTTP request, to extract the endpoint based on URL path and method, validate all necessary inputs, invoke the endpoint, validate all necesary outputs, and write the result to HTTP response.
 * This function is used by other TyRAS plugins and usually not directly by client code.
 * @param endpoints All the {@link ep.AppEndpoint}s to use in returned callback.
 * @param callbacks The {@link ServerFlowCallbacks} necessary to actually implement the returned callback.
 * @param events The {@link evt.ServerEventHandler} to invoke on events.
 * @returns The callback which can be used to asynchronously process incoming HTTP request, and write to outgoing HTTP response.
 */
export const createTypicalServerFlow = <
  TContext extends TContextBase,
  TStateInfo,
  TState,
>(
  // Notice - endpoints don't have GetContext<TContext> as their context!
  // The extra fields of GetContext<TContext> are meant to be used only by event handler!
  endpoints: ReadonlyArray<ep.AppEndpoint<TContext, TStateInfo>>,
  callbacks: ServerFlowCallbacks<TContext, TStateInfo>,
  events: evt.ServerEventHandler<GetContext<TContext>, TState> | undefined,
): ((context: TContext) => Promise<void>) => {
  const { handler, url: regExp } = squashEndpoints(endpoints);
  const cb: ServerFlowCallbacks<GetContext<TContext>, TStateInfo> = {
    ...callbacks,
    setStatusCode: (...params) => {
      if (!params[0].skipSettingStatusCode) {
        callbacks.setStatusCode(...params);
      }
    },
    sendContent: async (...params) => {
      if (!params[0].skipSendingBody) {
        await callbacks.sendContent(...params);
      }
    },
  };
  // eslint-disable-next-line sonarjs/cognitive-complexity
  return async (_ctx) => {
    // TODO Idea: refactor this to use functional constructs? I rather not add fp-ts as dependency though...
    const ctx: GetContext<TContext> = {
      ..._ctx,
      skipSendingBody: false,
      skipSettingStatusCode: false,
    };
    try {
      const maybeURL = cb.getURL(ctx);
      const parsedUrl =
        maybeURL instanceof url.URL
          ? maybeURL
          : new url.URL(maybeURL, "http://example.com");
      const maybeEventArgs = server.checkURLPathNameForHandler(
        ctx,
        events,
        parsedUrl,
        regExp,
      );
      if (maybeEventArgs) {
        // We have a match -> get the handler that will handle our match
        const method = cb.getMethod(ctx) as protocol.HttpMethod;
        let foundHandler = handler(method, maybeEventArgs.groups);
        const sendBody = method !== protocol.METHOD_HEAD;
        if (
          foundHandler.found !== "handler" &&
          !sendBody &&
          foundHandler.allowedMethods.some(
            ({ method }) => method === protocol.METHOD_GET,
          )
        ) {
          foundHandler = handler(protocol.METHOD_GET, maybeEventArgs.groups);
        }

        if (foundHandler.found === "handler") {
          const {
            handler: {
              stateInformation,
              urlValidator,
              headerValidator,
              queryValidator,
              bodyValidator,
              handler,
            },
          } = foundHandler;
          // At this point, check context state.
          // State typically includes things like username etc, so verifying it as a first thing before checking body is meaningful.
          // Also, allow the context state checker return custom status code, e.g. 401 for when lacking credentials.
          const stateValidation = server.checkStateForHandler(
            maybeEventArgs,
            events,
            stateInformation.validator,
            await cb.getState(ctx, stateInformation.stateInfo),
          );
          if (stateValidation.result === "state") {
            const eventArgs = {
              ...maybeEventArgs,
              state: stateValidation.state,
            };
            // State was OK, validate url & query & body
            const [proceedAfterURL, url] = server.checkURLParametersForHandler(
              eventArgs,
              events,
              urlValidator,
            );
            if (proceedAfterURL) {
              const [proceedAfterQuery, query] = server.checkQueryForHandler(
                eventArgs,
                events,
                queryValidator,
                Object.fromEntries(parsedUrl.searchParams.entries()),
              );
              if (proceedAfterQuery) {
                const [proceedAfterHeaders, headers] =
                  server.checkHeadersForHandler(
                    eventArgs,
                    events,
                    headerValidator,
                    (headerName) => cb.getHeader(ctx, headerName),
                  );
                if (proceedAfterHeaders) {
                  const reqContentType =
                    cb.getHeader(ctx, "content-type") ?? "";
                  const [proceedAfterBody, body] =
                    await server.checkBodyForHandler(
                      eventArgs,
                      events,
                      bodyValidator,
                      typeof reqContentType === "string"
                        ? reqContentType
                        : reqContentType[0],
                      cb.getRequestBody(ctx),
                    );
                  if (proceedAfterBody) {
                    const retVal = await server.invokeHandler(
                      eventArgs,
                      events,
                      handler,
                      {
                        context: eventArgs.ctx,
                        state: eventArgs.state,
                        url: url as ep.AppEndpointHandlerFunctionArgs<
                          GetContext<TContext>
                        >["url"],
                        headers,
                        body,
                        query,
                      },
                    );
                    if (retVal.error === "none") {
                      const { contentType, output, headers } = retVal.data;
                      if (headers) {
                        for (const [hdrName, hdrValue] of Object.entries(
                          headers,
                        )) {
                          if (hdrValue !== undefined) {
                            cb.setHeader(ctx, hdrName, hdrValue);
                          }
                        }
                      }
                      const hasOutput = output !== undefined;
                      cb.setStatusCode(
                        ctx,
                        hasOutput ? 200 : 204,
                        sendBody && hasOutput,
                      );
                      if (!sendBody) {
                        if (output instanceof stream.Readable) {
                          output.destroy();
                        } else {
                          const charsetIdx =
                            contentType.indexOf(CHARSET_MARKER);
                          cb.setHeader(
                            ctx,
                            "Content-Length",
                            `${
                              output === undefined
                                ? 0
                                : typeof output === "string"
                                ? Buffer.byteLength(
                                    output,
                                    charsetIdx > 0
                                      ? (contentType.substring(
                                          charsetIdx + CHARSET_MARKER.length,
                                        ) as BufferEncoding)
                                      : undefined,
                                  )
                                : output.byteLength
                            }`,
                          );
                        }
                      }
                      if (hasOutput) {
                        cb.setHeader(ctx, "Content-Type", contentType);
                        if (sendBody) {
                          await cb.sendContent(ctx, output);
                        }
                      }
                    } else {
                      // Internal Server Error
                      await sendCodeAndBody(
                        cb,
                        ctx,
                        retVal.error === "protocol-error"
                          ? retVal
                          : { statusCode: 500, body: undefined },
                      );
                    }
                  } else {
                    // Body failed validation
                    cb.setStatusCode(ctx, 422, false);
                  }
                } else {
                  // Headers validation failed
                  cb.setStatusCode(ctx, 400, false);
                }
              } else {
                // Query parameters failed validation
                cb.setStatusCode(ctx, 400, false);
              }
            } else {
              // While URL matched regex, the parameters failed further validation
              cb.setStatusCode(ctx, 400, false);
            }
          } else {
            // Context validation failed - set status code
            cb.setStatusCode(
              ctx,
              stateValidation.customStatusCode ?? 500,
              true,
            ); // Internal server error
            await cb.sendContent(ctx, stateValidation.customBody);
          }
        } else {
          const allowedMethodsSentToClient =
            await server.invokeInvalidMethodEvent(
              maybeEventArgs,
              events,
              foundHandler.allowedMethods,
              method === protocol.METHOD_OPTIONS
                ? undefined
                : async (stateValidator) =>
                    stateValidator.validator(
                      await cb.getState(ctx, stateValidator.stateInfo),
                    ).error === "none",
            );

          if (!ctx.skipSettingStatusCode) {
            const statusCode =
              allowedMethodsSentToClient.length > 0
                ? method === protocol.METHOD_OPTIONS
                  ? 200
                  : 405
                : 404;
            if (statusCode !== 404) {
              cb.setHeader(ctx, "Allow", allowedMethodsSentToClient.join(","));
            }
            cb.setStatusCode(ctx, statusCode, false);
          }
        }
      } else {
        // Not Found
        cb.setStatusCode(ctx, 404, false);
      }
    } catch (error) {
      try {
        events?.("onException", { ctx, regExp, error });
      } catch {
        // Not that much we can do.
      }
      try {
        await sendCodeAndBody(
          cb,
          ctx,
          error instanceof dataBE.HTTPError
            ? { statusCode: error.statusCode, body: error.body }
            : { statusCode: 500, body: undefined },
          { error },
        );
      } catch {
        // TODO add method to callbacks to close the stream in this case.
      }
    }
  };
};

/**
 * The base type constraint for any server context in {@link createTypicalServerFlow}.
 */
export type TContextBase = object;

/**
 * The interface which encapsulates all the 'native' server context functionality needed by {@link createTypicalServerFlow}, which doesn't require endpoint-specific state information.
 */
export interface ServerFlowCallbacksWithoutState<TContext> {
  /**
   * Callback to extract the HTTP request URL from server context.
   * @param ctx The server context.
   * @returns The URL of the HTTP request - either as {@link url.URL} or as `string`.
   */
  getURL: (ctx: TContext) => url.URL | string;

  /**
   * Callback to extract HTTP request method from server context.
   * @param ctx The server context.
   * @returns The HTTP request method.
   */
  getMethod: (ctx: TContext) => string;

  /**
   * Callback to extract HTTP request header by its name from server context.
   * @param ctx The server context.
   * @param headerName The header name.
   * @returns The header value, if present.
   */
  getHeader: (ctx: TContext, headerName: string) => data.ReadonlyHeaderValue;

  /**
   * Callback to extract HTTP request body as {@link stream.Readable} from server context.
   * @param ctx The server context.
   * @returns The request body as {@link stream.Readable}, if present.
   */
  getRequestBody: (ctx: TContext) => stream.Readable | undefined;

  /**
   * The callback to set the specified HTTP response header to specified value using server context.
   * @param ctx The server context.
   * @param headerName The header name.
   * @param headerValue The header value.
   * @returns Nothing.
   */
  setHeader: (
    ctx: TContext,
    headerName: string,
    headerValue: Exclude<data.HeaderValue, undefined>,
  ) => void;

  /**
   * The callback to set the specified HTTP response status code to specified value using server context.
   * @param ctx The server context.
   * @param statusCode The status code as number.
   * @param willCallSendContent Whether the {@link createTypicalServerFlow} will also call `sendContent` after this.
   * @param error The error, if any occurred.
   * @returns Nothing.
   */
  setStatusCode: (
    ctx: TContext,
    statusCode: number,
    willCallSendContent: boolean,
    error?: unknown,
  ) => void;

  /**
   * Callback to send the HTTP response body using server context.
   * @param ctx The server context.
   * @param content The HTTP response body.
   * @returns Possibly asynchronously nothing.
   */
  sendContent: (
    ctx: TContext,
    content: dataBE.DataValidatorResponseOutputSuccess["output"],
  ) => ep.MaybePromise<void>;
}

/**
 * This interface extends {@link ServerFlowCallbacksWithoutState} to introduce one additional callback utilizing endpoint state specification.
 */
export interface ServerFlowCallbacks<TContext, TStateInfo>
  extends ServerFlowCallbacksWithoutState<TContext> {
  /**
   * Callback to construct state object for the endpoint, using information about the state that endpoint requires (e.g. property names).
   * @param ctx The server context.
   * @param stateInfo The state specification of the endpoint.
   * @returns Possibly asynchronously returns the state object, which will be validated by the caller.
   */
  getState: (ctx: TContext, stateInfo: TStateInfo) => ep.MaybePromise<unknown>;
}

/**
 * Auxiliary type to allow event handlers to modify the context.
 */
export type GetContext<TContext> = TContext & {
  skipSettingStatusCode: boolean;
  skipSendingBody: boolean;
};

const CHARSET_MARKER = "charset=";

const sendCodeAndBody = async <TContext>(
  cb: ServerFlowCallbacksWithoutState<TContext>,
  ctx: GetContext<TContext>,
  codeAndBody: { statusCode: number; body: string | undefined },
  error?: { error: unknown },
) => {
  const willCallSendContent = codeAndBody.body !== undefined;
  const args: Parameters<(typeof cb)["setStatusCode"]> = [
    ctx,
    codeAndBody.statusCode,
    willCallSendContent,
  ];
  if (error) {
    args.push(error.error);
  }
  cb.setStatusCode(...args);
  if (willCallSendContent) {
    await cb.sendContent(ctx, codeAndBody.body);
  }
};
