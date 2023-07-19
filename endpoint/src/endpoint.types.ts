/**
 * @file This file contains types related to specify single {@link AppEndpoint}.
 */

import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import type * as protocol from "@ty-ras/protocol";

/**
 * This interface defines how BE HTTP endpoint is expressed.
 * It binds to one URL path RegExp, but allows one more more actual endpoint implementations, depending on HTTP method.
 * @see FinalizedAppEndpoint
 */
export interface AppEndpoint<TContext, TStateInfo> {
  /**
   * This function will return {@link FinalizedAppEndpoint} with URL path pattern which uses given string prefix for capturing URL path parameters.
   * @param groupNamePrefix The prefix to use for group names in the RegExp.
   * @returns The {@link FinalizedAppEndpoint} containing information about URL path pattern, and endpoint handler.
   */
  getRegExpAndHandler: (
    groupNamePrefix: string,
  ) => FinalizedAppEndpoint<TContext, TStateInfo>;
}

/**
 * Objects of this type are created by {@link AppEndpoint}, and they represent a finalized BE HTTP endpoint behind a single URL path string pattern, but under one or more HTTP methods.
 * @see AppEndpointHandlerGetter
 */
export interface FinalizedAppEndpoint<TContext, TStateInfo> {
  /**
   * The pattern to match URL path strings, as {@link RegExp} with named groups for each used URL path parameter name.
   */
  url: RegExp;

  /**
   * The {@link AppEndpointHandlerGetter} callback to acquire actual handler for given HTTP method.
   */
  handler: AppEndpointHandlerGetter<TContext, TStateInfo>;
}

/**
 * This is signature for callback which should get the {@link AppEndpointHandlerGetterResult} for given {@link data.HttpMethod}, and named URL path parameters captured by {@link RegExp} of {@link FinalizedAppEndpoint}.
 */
export type AppEndpointHandlerGetter<TContext, TStateInfo> = (
  method: protocol.HttpMethod,
  groups: Record<string, string | undefined>,
) => AppEndpointHandlerGetterResult<TContext, TStateInfo>;

/**
 * This is discriminated union type of return value of {@link AppEndpointHandlerGetter}.
 */
export type AppEndpointHandlerGetterResult<TContext, TStateInfo> =
  | AppEndpointHandlerGetterResultInvalidMethod<TStateInfo>
  | AppEndpointHandlerGetterResultSuccess<TContext, TStateInfo>;

/**
 * This is one possible {@link AppEndpointHandlerGetterResult}, signifying that the given {@link data.HttpMethod} is not supported by this endpoint.
 */
export interface AppEndpointHandlerGetterResultInvalidMethod<TStateInfo> {
  /**
   * This property is type discriminator property identifying this as {@link AppEndpointHandlerGetterResultInvalidMethod}.
   */
  found: "invalid-method";

  /**
   * These are the methods which are supported by the endpoint.
   */
  allowedMethods: Array<EndpointMethodInformation<TStateInfo>>;
}

/**
 * This is one possible {@link AppEndpointHandlerGetterResult}, signifying that the {@link data.HttpMethod} was supported, and the {@link AppEndpointHandler} for the endpoint is available.
 */
export interface AppEndpointHandlerGetterResultSuccess<TContext, TStateInfo> {
  /**
   * This property is type discriminator property identifying this as {@link AppEndpointHandlerGetterResultSuccess}.
   */
  found: "handler";

  /**
   * The {@link AppEndpointHandler} containing all necessary information to handle this HTTP request.
   */
  handler: AppEndpointHandler<TContext, TStateInfo>;
}

/**
 * This interface captures information about which HTTP methods are allowed for a single {@link FinalizedAppEndpoint}.
 */
export interface EndpointMethodInformation<TStateInfo> {
  /**
   * The {@link data.HttpMethod} that is allowed.
   */
  method: protocol.HttpMethod;

  /**
   * The {@link EndpointStateInformation} about the endpoint for this method.
   */
  stateInformation: EndpointStateInformation<TStateInfo, unknown>;
}

/**
 * This is the interface exposed by successful return type of {@link AppEndpointHandlerGetter} via {@link AppEndpointHandlerGetterResultSuccess}, containing all necessary information to process an incoming HTTP request.
 */
export type AppEndpointHandler<TContext, TStateInfo> = {
  /**
   * The information about state/context that this endpoint requires.
   */
  stateInformation: EndpointStateInformation<TStateInfo, unknown>;

  /**
   * The information about parameters extracted from URL path string, if this endpoint uses them.
   */
  urlValidator?: AppEndpointURLPathParameterInformation | undefined;

  /**
   * The information about HTTP request headers, if this endpoint uses them.
   */
  headerValidator?:
    | dataBE.RequestHeaderDataValidators<protocol.TRequestHeadersDataBase>
    | undefined;

  /**
   * The information about URL query parameters, if this endpoint uses them.
   */
  queryValidator?:
    | dataBE.QueryDataValidators<protocol.TQueryDataBase>
    | undefined;

  /**
   * The information about HTTP request body, if this endpoint uses it.
   */
  bodyValidator?: dataBE.DataValidatorRequestInput<unknown> | undefined;

  /**
   * The {@link AppEndpointHandlerFunction} that will consume the state, URL path parameters, query parameters, request body, and headers, as validated by information provided by properties of this interface, and produce the result to be returned via HTTP response body.
   * @see AppEndpointHandlerFunction
   */
  handler: AppEndpointHandlerFunction<TContext>;
};

/**
 * This interface contains information about URL path parameters extracted from URL path string.
 */
export interface AppEndpointURLPathParameterInformation {
  /**
   * The mapping from URL path parameter name, to RegExp group name.
   */
  groupNames: Record<string, string>;

  /**
   * The {@link dataBE.URLParameterValidators}, key being URL path parameter name, and value {@link data.DataValidator}.
   */
  validators: dataBE.URLParameterValidators<protocol.TURLDataBase>;
}

/**
 * This signature will take the {@link AppEndpointHandlerFunctionArgs} as parameter, and potentially asynchronously produce either {@link dataBE.DataValidatorResponseOutputError}, or {@link data.DataValidatorResponseOutputSuccess} containing information to be used when sending HTTP response back to client.
 */
export type AppEndpointHandlerFunction<TContext> = (
  args: AppEndpointHandlerFunctionArgs<TContext>,
) => MaybePromise<AppEndpointHandlerFunctionReturn>;

/**
 * This is the return type of {@link AppEndpointHandlerFunction}.
 */
export type AppEndpointHandlerFunctionReturn =
  | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>
  | dataBE.DataValidatorResponseOutputError;

/**
 * This interface contains all information used when invoking {@link AppEndpointHandlerFunction}.
 */
export interface AppEndpointHandlerFunctionArgs<TContext> {
  /**
   * The current server-implementation specific context. Should be used carefully, as it typically exposes mutable things.
   */
  context: TContext;

  /**
   * The state for the endpoint, as validated via {@link EndpointStateInformation} returned by {@link AppEndpointHandlerGetter} via {@link AppEndpointHandler}.
   */
  state: unknown;

  /**
   * The URL path parameters, as validated via {@link AppEndpointURLPathParameterInformation} returned by {@link AppEndpointHandlerGetter} via {@link AppEndpointHandler}.
   */
  url: protocol.TURLDataBase;

  /**
   * The request header data, as validated via {@link dataBE.RequestHeaderDataValidators} returned by {@link AppEndpointHandlerGetter} via {@link AppEndpointHandler}.
   */
  headers: protocol.TRequestHeadersDataBase;

  /**
   * The URL query parameters, as validated via {@link dataBE.QueryDataValidators} returned by {@link AppEndpointHandlerGetter} via {@link AppEndpointHandler}.
   */
  query: protocol.TQueryDataBase;

  /**
   * The parsed HTTP request body, as validated via {@link dataBE.DataValidatorRequestInput} returned by {@link AppEndpointHandlerGetter} via {@link AppEndpointHandler}.
   */
  body: unknown;
}

/**
 * Helper type to represent value which may be returned synchronously or asynchronously.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * The interface containing information about state/context used by a single BE HTTP endpoint via one HTTP method.
 */
export interface EndpointStateInformation<TStateInfo, TState> {
  /**
   * The information about the state/context.
   * Typically, this is an array of property names specifying which propertie should be extracted from some state common to HTTP server as a whole (e.g. "db" to get DB connection pool, etc).
   */
  stateInfo: TStateInfo;

  /**
   * The validator callback {@link dataBE.StateValidator} for the state collected based on the `stateInfo` property of this interface.
   */
  validator: dataBE.StateValidator<TState>;
}
