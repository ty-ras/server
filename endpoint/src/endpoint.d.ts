import type * as method from "./methods";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";

export interface AppEndpoint<TContext, TStateInfo> {
  getRegExpAndHandler: (
    groupNamePrefix: string,
  ) => FinalizedAppEndpoint<TContext, TStateInfo>;
}

export interface FinalizedAppEndpoint<TContext, TStateInfo> {
  url: RegExp;
  handler: DynamicHandlerGetter<TContext, TStateInfo>;
}

export type DynamicHandlerGetter<TContext, TStateInfo> = (
  method: method.HttpMethod,
  groups: Record<string, string | undefined>,
) => DynamicHandlerResponse<TContext, TStateInfo>;

export type DynamicHandlerResponse<TContext, TStateInfo> =
  | {
      found: "invalid-method";
      allowedMethods: Array<method.HttpMethod>;
    }
  | {
      found: "handler";
      handler: StaticAppEndpointHandler<TContext, TStateInfo>;
    };

export type StaticAppEndpointHandler<TContext, TStateInfo> = {
  stateValidator: EndpointStateValidator<TStateInfo, unknown>;
  urlValidator?:
    | {
        groupNames: Record<string, string>;
        validators: dataBE.URLParameterValidators<dataBE.RuntimeAnyURLData>;
      }
    | undefined;
  headerValidator?:
    | dataBE.RequestHeaderDataValidators<dataBE.RuntimeAnyHeaders>
    | undefined;
  queryValidator?:
    | dataBE.QueryDataValidators<dataBE.RuntimeAnyQuery>
    | undefined;
  bodyValidator?: dataBE.DataValidatorRequestInput<unknown> | undefined;
  handler: StaticAppEndpointHandlerFunction<TContext>;
};

export type StaticAppEndpointHandlerFunction<TContext> = (args: {
  context: TContext;
  state: unknown;
  url: unknown;
  method: method.HttpMethod;
  headers: dataBE.RuntimeAnyHeaders;
  query: unknown;
  body: unknown;
}) => MaybePromise<
  data.DataValidatorResult<dataBE.DataValidatorResponseOutputSuccess>
>;

export type MaybePromise<T> = T | Promise<T>;

export interface EndpointStateValidator<TStateInfo, TState> {
  stateInfo: TStateInfo;
  validator: dataBE.StateValidator<TState>;
}
