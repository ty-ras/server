import type * as method from "./methods";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";

export interface AppEndpoint<
  TContext,
  TMetadata extends Record<string, unknown>,
> {
  getRegExpAndHandler: (groupNamePrefix: string) => {
    url: RegExp;
    handler: DynamicHandlerGetter<TContext>;
  };
  getMetadata: (urlPrefix: string) => {
    [P in keyof TMetadata]: Array<TMetadata[P]>;
  };
}

export type DynamicHandlerGetter<TContext> = (
  method: method.HttpMethod,
  groups: Record<string, string | undefined>,
) => DynamicHandlerResponse<TContext>;

export type DynamicHandlerResponse<TContext> =
  | {
      found: "invalid-method";
      allowedMethods: Array<method.HttpMethod>;
    }
  | {
      found: "handler";
      handler: StaticAppEndpointHandler<TContext>;
    };

export type StaticAppEndpointHandler<TContext> = {
  contextValidator: dataBE.ContextValidatorSpec<TContext, unknown, unknown>;
  urlValidator?: {
    groupNames: Record<string, string>;
    validators: dataBE.URLParameterValidators<dataBE.RuntimeAnyURLData>;
  };
  headerValidator?: dataBE.RequestHeaderDataValidators<dataBE.RuntimeAnyHeaders>;
  queryValidator?: dataBE.QueryDataValidators<dataBE.RuntimeAnyQuery>;
  bodyValidator?: dataBE.DataValidatorRequestInput<unknown>;
  handler: StaticAppEndpointHandlerFunction<TContext>;
};

export type StaticAppEndpointHandlerFunction<TContext> = (args: {
  context: TContext;
  state: unknown;
  url: unknown;
  headers: dataBE.RuntimeAnyHeaders;
  query: unknown;
  body: unknown;
}) => MaybePromise<
  data.DataValidatorResult<dataBE.DataValidatorResponseOutputSuccess>
>;

export type MaybePromise<T> = T | Promise<T>;
