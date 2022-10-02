import type * as ctx from "./context";

export const createContextValidatorFactory =
  <TContext extends ctx.HKTContext>(
    getState: ctx.GetStateFromContext<TContext>,
  ): ctx.ContextValidatorFactory<TContext> =>
  (validator, protocolErrorInfo) => ({
    validator: (ctx) => {
      const transformed = validator(getState(ctx));
      if (transformed.error === "none") {
        return {
          error: "none" as const,
          data: ctx,
        };
      } else {
        return protocolErrorInfo === undefined
          ? transformed
          : {
              error: "protocol-error",
              statusCode:
                typeof protocolErrorInfo === "number"
                  ? protocolErrorInfo
                  : protocolErrorInfo.statusCode,
              body:
                typeof protocolErrorInfo === "number"
                  ? undefined
                  : protocolErrorInfo.body,
            };
      }
    },
    getState,
  });
