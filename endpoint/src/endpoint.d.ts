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
  method: data.HttpMethod,
  groups: Record<string, string | undefined>,
) => DynamicHandlerResponse<TContext, TStateInfo>;

export type DynamicHandlerResponse<TContext, TStateInfo> =
  | {
      found: "invalid-method";
      allowedMethods: Array<EndpointMethodInformation<TStateInfo>>;
    }
  | {
      found: "handler";
      handler: StaticAppEndpointHandler<TContext, TStateInfo>;
    };

export interface EndpointMethodInformation<TStateInfo> {
  method: data.HttpMethod;
  stateValidator: EndpointStateValidator<TStateInfo, unknown>;
}

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
  headers: dataBE.RuntimeAnyHeaders;
  query: unknown;
  body: unknown;
}) => MaybePromise<
  | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>
  | dataBE.DataValidatorResponseOutputError
>;

export type MaybePromise<T> = T | Promise<T>;

export interface EndpointStateValidator<TStateInfo, TState> {
  stateInfo: TStateInfo;
  validator: dataBE.StateValidator<TState>;
}
