/**
 * @file This file contains types needed for operating the builders of various stages defined in this directory.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";

/**
 * The state of stage 1,2, and 3 builders, constantly mutated as methods of the builders get invoked.
 */
export interface AppEndpointBuilderState<
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadata extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      unknown,
      unknown,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  /**
   * The static URL path parts used for endpoints.
   */
  fragments: ReadonlyArray<string>;

  /**
   * Endpoint specification data, per HTTP method.
   */
  methods: Partial<
    Record<
      data.HttpMethod,
      StaticAppEndpointBuilderSpec<
        TContext,
        TStateInfo,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadata
      >
    >
  >;

  /**
   * Current metadata information.
   */
  metadata: TMetadata;

  /**
   * The information about URL path parameters, if any are used.
   */
  urlValidation: URLValidationInfo<TStringDecoder>;
}

/**
 * The information about URL path parameters, if any are used.
 */
export type URLValidationInfo<TStringDecoder> =
  | {
      /**
       * The names of the path parameters.
       */
      args: ReadonlyArray<string>;

      /**
       * The data validation of path parameters.
       */
      validation: dataBE.URLParameterValidatorSpec<
        dataBE.RuntimeAnyURLData,
        TStringDecoder
      >;
    }
  | undefined;

/**
 * The state for endpoint for certain URL path parameters and certain HTTP method.
 */
export interface StaticAppEndpointBuilderSpec<
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadata extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      unknown,
      unknown,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  /**
   * Callback to create {@link ep.AppEndpointHandler} for some RegExp group name prefix.
   */
  builder: StaticAppEndpointBuilder<TContext, TStateInfo>;

  /**
   * The state information for the endpoint.
   */
  stateInformation: ep.EndpointStateInformation<TStateInfo, unknown>;

  /**
   * The specification for request headers data, if any.
   */
  requestHeadersSpec?: dataBE.RequestHeaderDataValidatorSpecMetadata<
    string,
    TStringDecoder
  >;

  /**
   * The specification for response headers data, if any.
   */
  responseHeadersSpec?: dataBE.ResponseHeaderDataValidatorSpecMetadata<
    string,
    TStringEncoder
  >;

  /**
   * The specification for URL query parameters, if any.
   */
  queryValidation?: dataBE.QueryDataValidatorSpecMetadata<
    string,
    TStringDecoder
  >;

  /**
   * The specification for request body, if any.
   */
  inputValidation?: dataBE.DataValidatorResponseInputValidatorSpec<TInputContents>;

  /**
   * The specification for response body.
   */
  outputValidation: dataBE.DataValidatorResponseOutputValidatorSpec<TOutputContents>;

  /**
   * The data for metadata providers.
   */
  mdArgs: {
    [P in keyof TMetadata]: TMetadata[P] extends md.MetadataProviderForEndpoints<
      infer TArg,
      infer _0,
      infer _1,
      infer _2,
      infer _3,
      infer _4,
      infer _5
    >
      ? md.Kind<
          TArg,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>
        >
      : never;
  };
}

/**
 * Callback to create {@link ep.AppEndpointHandler} for some RegExp group name prefix.
 */
export type StaticAppEndpointBuilder<TContext, TStateInfo> = (
  groupNamePrefix: string,
  // groups: Record<string, string>,
) => ep.AppEndpointHandler<TContext, TStateInfo>;

/**
 * Information about URL query parameters.
 */
export interface QueryInfo<TArgs, TDecoder> {
  /**
   * The query parameters specification, if any.
   */
  query?: dataBE.QueryValidatorSpec<dataBE.RuntimeAnyQuery, TDecoder>;

  /**
   * Constructs the partial endpoint handler args object.
   * @param query The validated query data
   * @returns The object to be merged with others and passed to endpoint handler
   */
  getEndpointArgs: (query: unknown) => TArgs;
}

/**
 * Information about request headers data.
 */
export interface HeaderDataInfo<TArgs, THeaderValidators> {
  /**
   * The request headers data specification, if any.
   */
  headers?: dataBE.RequestHeaderDataValidatorSpec<
    Record<string, unknown>,
    THeaderValidators
  >;

  /**
   * Constructs the partial endpoint handler args object.
   * @param headers The validated request headers data
   * @returns The object to be merged with others and passed to endpoint handler
   */
  getEndpointArgs: (headers: dataBE.RuntimeAnyHeaders) => TArgs;
}
