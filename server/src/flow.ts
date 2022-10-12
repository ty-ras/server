import * as ep from "@ty-ras/endpoint";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as server from "./utils";
import * as evt from "./events";

import * as url from "url";
import * as stream from "stream";

export const typicalServerFlow = async <TContext, TState>(
  ctx: TContext,
  {
    url: regExp,
    handler,
  }: ReturnType<
    ep.AppEndpoint<TContext, Record<string, unknown>>["getRegExpAndHandler"]
  >,
  events: evt.ServerEventEmitter<TContext, TState> | undefined,
  {
    getURL,
    getMethod,
    getHeader,
    getRequestBody,
    setHeader,
    setStatusCode,
    sendContent,
  }: ServerFlowCallbacks<TContext>, // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  try {
    const maybeURL = getURL(ctx);
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
      const foundHandler = server.checkMethodForHandler(
        maybeEventArgs,
        events,
        getMethod(ctx) as ep.HttpMethod,
        handler,
      );

      if (foundHandler.found === "handler") {
        const {
          handler: {
            contextValidator,
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
        const contextValidation = server.checkContextForHandler(
          maybeEventArgs,
          events,
          contextValidator,
        );
        if (contextValidation.result === "context") {
          const eventArgs = {
            ...maybeEventArgs,
            ctx: contextValidation.context as typeof ctx,
            state: contextValidation.state as TState,
          };
          ctx = eventArgs.ctx;
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
                  (headerName) => getHeader(ctx, headerName),
                );
              if (proceedAfterHeaders) {
                const reqContentType = getHeader(ctx, "content-type") ?? "";
                const [proceedAfterBody, body] =
                  await server.checkBodyForHandler(
                    eventArgs,
                    events,
                    bodyValidator,
                    Array.isArray(reqContentType)
                      ? reqContentType[0]
                      : reqContentType,
                    getRequestBody(ctx),
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
                              setHeader(ctx, hdrName, hdrValue);
                            }
                          }
                        }
                        const hasOutput = output !== undefined;
                        setStatusCode(ctx, hasOutput ? 200 : 204, hasOutput);
                        if (hasOutput) {
                          setHeader(ctx, "Content-Type", contentType);
                          await sendContent(ctx, output);
                        }
                      }
                      break;
                    case "error": {
                      // Internal Server Error
                      setStatusCode(ctx, 500, false);
                    }
                  }
                } else {
                  // Body failed validation
                  setStatusCode(ctx, 422, false);
                }
              } else {
                // Headers validation failed
                setStatusCode(ctx, 400, false);
              }
            } else {
              // Query parameters failed validation
              setStatusCode(ctx, 400, false);
            }
          } else {
            // While URL matched regex, the parameters failed further validation
            setStatusCode(ctx, 400, false);
          }
        } else {
          // Context validation failed - set status code
          setStatusCode(ctx, contextValidation.customStatusCode ?? 500, true); // Internal server error
          await sendContent(ctx, contextValidation.customBody);
        }
      } else {
        setHeader(ctx, "Allow", foundHandler.allowedMethods.join(","));
        setStatusCode(ctx, 405, false);
      }
    } else {
      // Not Found
      setStatusCode(ctx, 404, false);
    }
  } catch (error) {
    try {
      events?.("onException", { ctx, regExp, error });
    } catch {
      // Not that much we can do.
    }
    setStatusCode(ctx, 500, false, error);
  }
};

export interface ServerFlowCallbacks<TContext> {
  getURL: (ctx: TContext) => url.URL | string | undefined;
  getMethod: (ctx: TContext) => string;
  getHeader: (ctx: TContext, headerName: string) => data.HeaderValue;
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
