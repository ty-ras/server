/**
 * @file This file contains common types used by code of this library.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as ep from "@ty-ras/endpoint";

/**
 * This is base type constraint for all stage builders of this library.
 */
export type MetadataProvidersBase<
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
> = Record<
  string,
  // We must use 'any' as some parameters, otherwise we won't be able to use AppEndpointBuilderProvider with specific TMetadataProviders type as parameter to functions.
  md.MetadataProvider<
    md.HKTArg,
    any,
    any,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    any,
    any,
    unknown
  >
>;

/**
 * This interface contains the minimal set of arguments for callback handling the validated HTTP request data.
 */
export interface EndpointHandlerArgs<TContext, TState> {
  /**
   * The server-specific context. Rarely needed, and should be handled with care, as it exposes mutable things and possibility to write to response body.
   */
  context: TContext;

  /**
   * The validated state as per {@link ep.EndpointStateInformation}.
   */
  state: TState;
}

/**
 * This interface contains the property for validated URL path pararameters, if HTTP endpoint specifies them.
 */
export interface EndpointHandlerArgsWithURL<TDataInURL> {
  /**
   * The validated URL path parameters.
   */
  url: TDataInURL;
}

/**
 * This interface contains the property for validated HTTP request header data, if HTTP endpoint specifies them.
 */
export interface EndpointHandlerArgsWithHeaders<THeaderData> {
  /**
   * The validated HTTP response headers.
   */
  headers: THeaderData;
}

/**
 * This interface contains the property for validated URL query parameters, if HTTP endpoint specifies them.
 */
export interface EndpointHandlerArgsWithQuery<TQuery> {
  /**
   * The validated URL query parameters.
   */
  query: TQuery;
}

/**
 * This interface contains the property for validated HTTP request body, if HTTP endpoints specifies it uses it.
 */
export interface EndpointHandlerArgsWithBody<TBody> {
  /**
   * The validated HTTP request body.
   */
  body: TBody;
}

/**
 * The object specifying {@link EndpointHandler} along with {@link data.ResponseHeaderDataValidatorSpec} for the response headers.
 */
export type EndpointHandlerSpec<
  TArgs,
  THandlerResult,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringEncoder,
> = {
  /**
   * The {@link EndpointHandler} returning data for HTTP response body, and also headers.
   */
  handler: EndpointHandler<
    TArgs,
    EndpointHandlerOutputWithHeaders<THandlerResult, THeaderData>
  >;
  /**
   * The {@link data.ResponseHeaderDataValidatorSpec} used to validate header data returned by `handler`.
   */
  headers: data.ResponseHeaderDataValidatorSpec<THeaderData, TStringEncoder>;
};

/**
 * The callback which handles the validated input from HTTP request, and possibly asynchronously produces data for HTTP response.
 */
export type EndpointHandler<TArgs, THandlerResult> = (
  this: void,
  args: TArgs,
) => ep.MaybePromise<THandlerResult>;

/**
 * The return type of the {@link EndpointHandler} when it is supposed to return both HTTP response body and headers in {@link EndpointHandlerSpec}.
 */
export interface EndpointHandlerOutputWithHeaders<
  TOutput,
  THeaderData extends data.RuntimeAnyHeaders,
> {
  /**
   * The data for HTTP response body. Will be validated.
   */
  body: TOutput;
  /**
   * The data for HTTP response headers. Will be validated.
   */
  headers: THeaderData;
}

/**
 * This interface encapsulates {@link ep.AppEndpoint} along with callback to get {@link AppEndpointMetadataResult}.
 */
export interface AppEndpointWithMetadata<
  TContext,
  TStateInfo,
  TMetadata extends Record<string, unknown>,
> {
  /**
   * The {@link ep.AppEndpoint}.
   */
  endpoint: ep.AppEndpoint<TContext, TStateInfo>;

  /**
   * The callback to get {@link AppEndpointMetadataResult} for given URL prefix.
   * @param urlPrefix The URL prefix.
   * @returns The {@link AppEndpointMetadataResult}.
   */
  getMetadata: (
    urlPrefix: string,
  ) => AppEndpointMetadataResult<TStateInfo, TMetadata>;
}

/**
 * The return value of metadata getter callback of {@link AppEndpointWithMetadata}.
 */
export interface AppEndpointMetadataResult<TStateInfo, TMetadata> {
  /**
   * The metadata.
   */
  metadata: TMetadata;

  /**
   * Information about state/context of the endpoint, where key is {@link data.HttpMethod}, and values are state informations (typically property names of the data used from HTTP server-wide state).
   */
  stateInfo: Record<string, TStateInfo>;
}
