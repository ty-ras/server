import type * as ep from "./endpoint";

// TODO This is not optimal solution.
// Refactor when issue #16 gets addressed.
export const withCORSOptions = <
  TContext,
  TStateInfo,
  TMetadata extends Record<string, unknown>,
>(
  ep: ep.AppEndpoint<TContext, TStateInfo, TMetadata>,
  { origin, allowHeaders }: CORSOptions,
): ep.AppEndpoint<TContext, TStateInfo, TMetadata> => ({
  getRegExpAndHandler: (groupNamePrefix) => {
    const { handler, ...retVal } = ep.getRegExpAndHandler(groupNamePrefix);
    return {
      ...retVal,
      handler: (method, groups) => {
        let handlerResult = handler(method, groups);
        if (handlerResult.found === "invalid-method" && method === "OPTIONS") {
          handlerResult = {
            found: "handler",
            handler: {
              handler: () => ({
                error: "none",
                data: {
                  output: undefined,
                  contentType: "will-not-be-used",
                  headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Headers":
                      typeof allowHeaders === "string"
                        ? allowHeaders
                        : allowHeaders.join(","),
                  },
                },
              }),
              stateValidator: {
                stateInfo: undefined as unknown as TStateInfo,
                validator: () => ({ error: "none", data: undefined }),
              },
            },
          };
        } else if (handlerResult.found === "handler") {
          const { handler: requestHandler, ...rest } = handlerResult.handler;
          handlerResult = {
            found: "handler",
            handler: {
              ...rest,
              handler: async (args) => {
                const result = await requestHandler(args);
                if (result.error === "none") {
                  result.data.headers = Object.assign(
                    result.data.headers ?? {},
                    {
                      "Access-Control-Allow-Origin": origin,
                    },
                  );
                }

                return result;
              },
            },
          };
        }
        return handlerResult;
      },
    };
  },
  getMetadata: (urlPrefix) => ep.getMetadata(urlPrefix),
});

export interface CORSOptions {
  origin: string;
  allowHeaders: string | Array<string>;
  // TODO allow methods, etc
}
