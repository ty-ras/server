import * as ep from "@ty-ras/endpoint";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as server from "./utils";
import * as evt from "./events";

import * as url from "url";
import * as stream from "stream";

export const createTypicalServerFlow = <
  TContext extends TContextBase,
  TStateInfo,
  TState,
>(
  // Notice - endpoints don't have GetContext<TContext> as their context!
  // The extra fields of GetContext<TContext> are meant to be used only by event handler!
  { url: regExp, handler }: ep.FinalizedAppEndpoint<TContext, TStateInfo>,
  callbacks: ServerFlowCallbacks<TContext, TStateInfo>,
  events: evt.ServerEventHandler<GetContext<TContext>, TState> | undefined,
): ((context: TContext) => Promise<void>) => {
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
    // TODO refactor this to use functional constructs once the issue in ty-ras/data repository is done.
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
          : new url.URL(maybeURL ?? "", "http://example.com");
      const maybeEventArgs = server.checkURLPathNameForHandler(
        ctx,
        events,
        parsedUrl,
        regExp,
      );
      if (maybeEventArgs) {
        // We have a match -> get the handler that will handle our match
        const method = cb.getMethod(ctx) as ep.HttpMethod;
        let foundHandler = handler(method, maybeEventArgs.groups);
        const sendBody = method !== "HEAD";
        if (
          foundHandler.found !== "handler" &&
          !sendBody &&
          foundHandler.allowedMethods.some(({ method }) => method === "GET")
        ) {
          foundHandler = handler("GET", maybeEventArgs.groups);
        }

        if (foundHandler.found === "handler") {
          const {
            handler: {
              stateValidator,
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
            stateValidator.validator,
            await cb.getState(ctx, stateValidator.stateInfo),
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
                // parsedUrl.search.substring(1), // Remove leading '?'
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
                      Array.isArray(reqContentType)
                        ? reqContentType[0]
                        : reqContentType,
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
                        url,
                        headers,
                        body,
                        query,
                      },
                    );
                    switch (retVal.error) {
                      case "none":
                        {
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
                                              charsetIdx +
                                                CHARSET_MARKER.length,
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
                        }
                        break;
                      case "error": {
                        // Internal Server Error
                        cb.setStatusCode(ctx, 500, false);
                      }
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
              method === "OPTIONS"
                ? undefined
                : async (stateValidator) =>
                    stateValidator.validator(
                      await cb.getState(ctx, stateValidator.stateInfo),
                    ).error === "none",
            );

          if (!ctx.skipSettingStatusCode) {
            const statusCode =
              allowedMethodsSentToClient.length > 0 ? 405 : 404;
            if (statusCode === 405) {
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
      cb.setStatusCode(ctx, 500, false, error);
    }
  };
};

export type TContextBase = object;

export interface ServerFlowCallbacksWithoutState<TContext> {
  getURL: (ctx: TContext) => url.URL | string | undefined;
  getMethod: (ctx: TContext) => string;
  getHeader: (ctx: TContext, headerName: string) => data.ReadonlyHeaderValue;
  getRequestBody: (ctx: TContext) => stream.Readable | undefined;
  setHeader: (
    ctx: TContext,
    headerName: string,
    headerValue: Exclude<data.HeaderValue, undefined>,
  ) => void;
  setStatusCode: (
    ctx: TContext,
    statusCode: number,
    willCallSendContent: boolean,
    error?: unknown,
  ) => void;
  sendContent: (
    ctx: TContext,
    content: dataBE.DataValidatorResponseOutputSuccess["output"],
  ) => void | Promise<void>;
}

export type ServerFlowCallbacks<TContext, TStateInfo> =
  ServerFlowCallbacksWithoutState<TContext> & {
    getState: (
      ctx: TContext,
      stateInfo: TStateInfo,
    ) => ep.MaybePromise<unknown>;
  };

export type GetContext<TContext> = TContext & {
  skipSettingStatusCode: boolean;
  skipSendingBody: boolean;
};

// This is to fix Array.isArray type-inference not working for ReadonlyArray
// https://github.com/microsoft/TypeScript/issues/17002#issuecomment-1217386617
type IfUnknownOrAny<T, Y, N> = unknown extends T ? Y : N;

type ArrayType<T> = IfUnknownOrAny<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T[] extends T ? T[] : any[] & T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Extract<T, readonly any[]>
>;

declare global {
  interface ArrayConstructor {
    isArray<T>(arg: T): arg is ArrayType<T>;
  }
}

const CHARSET_MARKER = "charset=";
