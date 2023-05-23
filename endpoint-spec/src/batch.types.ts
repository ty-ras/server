/**
 * @file This file contains types related to specifying endpoints in batch style via single interface, as opposed to using builder pattern.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import type * as data from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common.types";

/**
 * This interface contains required information for specifying single HTTP BE endpoint which does not use HTTP request body.
 */
export interface BatchSpecificationWithoutBody<
  TContext,
  TStateInfo,
  TState,
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      any
    >
  >,
> extends BatchSpecificationWithoutBodyWithoutHandler<
      TStateInfo,
      TState,
      TMethod,
      undefined,
      TOutput,
      TOutputContentTypes,
      TEndpointArgs,
      TMetadataProviders
    >,
    EndpointSpecArgsWithHandler<TContext, TState, TEndpointArgs, TOutput> {}

/**
 * This interface contains required information for specifying single HTTP BE endpoint which uses HTTP request body.
 */
export interface BatchSpecificationWithBody<
  TContext,
  TStateInfo,
  TState,
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> extends BatchSpecificationWithBodyWithoutHandler<
      TStateInfo,
      TState,
      TMethod,
      undefined,
      TOutput,
      TOutputContentTypes,
      TInput,
      TInputContentTypes,
      TEndpointArgs,
      TMetadataProviders
    >,
    EndpointSpecArgsWithHandler<
      TContext,
      TState,
      TEndpointArgs & common.EndpointHandlerArgsWithBody<TInput>,
      TOutput
    > {}

/**
 * This interface contains required information for specifying single HTTP BE endpoint which does not use HTTP request body, but uses HTTP request headers.
 */
export interface BatchSpecificationWithoutBodyWithHeaders<
  TContext,
  TStateInfo,
  TState,
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringDecoder,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      any
    >
  >,
> extends BatchSpecificationWithoutBodyWithoutHandler<
      TStateInfo,
      TState,
      TMethod,
      THeaderData,
      TOutput,
      TOutputContentTypes,
      TEndpointArgs,
      TMetadataProviders
    >,
    EndpointSpecArgsWithHandler<
      TContext,
      TState,
      TEndpointArgs,
      common.EndpointHandlerOutputWithHeaders<TOutput, THeaderData>
    >,
    BatchSpecificationResponseHeaderArgs<THeaderData, TStringDecoder> {}

/**
 * This interface contains required information for specifying single HTTP BE endpoint which uses HTTP request body and headers.
 */
export interface BatchSpecificationWithBodyWithHeaders<
  TContext,
  TStateInfo,
  TState,
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringDecoder,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> extends BatchSpecificationWithBodyWithoutHandler<
      TStateInfo,
      TState,
      TMethod,
      THeaderData,
      TOutput,
      TOutputContentTypes,
      TInput,
      TInputContentTypes,
      TEndpointArgs,
      TMetadataProviders
    >,
    EndpointSpecArgsWithHandler<
      TContext,
      TState,
      TEndpointArgs & common.EndpointHandlerArgsWithBody<TInput>,
      common.EndpointHandlerOutputWithHeaders<TOutput, THeaderData>
    >,
    BatchSpecificationResponseHeaderArgs<THeaderData, TStringDecoder> {}

/**
 * This is base interface for {@link BatchSpecificationWithoutBody} and {@link BatchSpecificationWithoutBodyWithHeaders}.
 */
export interface BatchSpecificationWithoutBodyWithoutHandler<
  TStateInfo,
  TState,
  TMethod,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      any
    >
  >,
> extends BatchSpecificationWithMethodAndState<TStateInfo, TState, TMethod>,
    EndpointSpecArgsJustResponseBody<TOutput, TOutputContentTypes> {
  /**
   * The object of {@link md.MetadataProviderForEndpoints} for each of the used metadata provider (e.g. OpenAPI, etc).
   */
  mdArgs: {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
      infer TArg,
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _1,
      infer _2,
      infer _3,
      TOutputContentTypes,
      infer _4
    >
      ? md.Kind<
          TArg,
          TEndpointArgs extends common.EndpointHandlerArgsWithURL<unknown>
            ? { [P in keyof TEndpointArgs["url"]]: unknown }
            : undefined,
          TEndpointArgs extends common.EndpointHandlerArgsWithQuery<unknown>
            ? { [P in keyof TEndpointArgs["query"]]: unknown }
            : undefined,
          TEndpointArgs extends common.EndpointHandlerArgsWithHeaders<unknown>
            ? { [P in keyof TEndpointArgs["headers"]]: unknown }
            : undefined,
          undefined extends TResponseHeaders
            ? undefined
            : { [P in keyof TResponseHeaders]: unknown },
          undefined,
          { [P in keyof TOutputContentTypes]: TOutput }
        >
      : never;
  };
}

/**
 * This is base interface for {@link BatchSpecificationWithBody} and {@link BatchSpecificationWithBodyWithHeaders}.
 */
export interface BatchSpecificationWithBodyWithoutHandler<
  TStateInfo,
  TState,
  TMethod,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> extends BatchSpecificationWithMethodAndState<TStateInfo, TState, TMethod>,
    EndpointSpecArgsJustResponseBody<TOutput, TOutputContentTypes>,
    EndpointSpecArgsJustBody<TInput, TInputContentTypes> {
  /**
   * The object of {@link md.MetadataProviderForEndpoints} for each of the used metadata provider (e.g. OpenAPI, etc).
   */
  mdArgs: {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
      infer TArg,
      infer _0, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _1,
      infer _2,
      infer _3,
      TOutputContentTypes,
      TInputContentTypes
    >
      ? md.Kind<
          TArg,
          TEndpointArgs extends common.EndpointHandlerArgsWithURL<unknown>
            ? { [P in keyof TEndpointArgs["url"]]: unknown }
            : undefined,
          TEndpointArgs extends common.EndpointHandlerArgsWithQuery<unknown>
            ? { [P in keyof TEndpointArgs["query"]]: unknown }
            : undefined,
          TEndpointArgs extends common.EndpointHandlerArgsWithHeaders<unknown>
            ? { [P in keyof TEndpointArgs["headers"]]: unknown }
            : undefined,
          undefined extends TResponseHeaders
            ? undefined
            : { [P in keyof TResponseHeaders]: unknown },
          { [P in keyof TInputContentTypes]: TInput },
          { [P in keyof TOutputContentTypes]: TOutput }
        >
      : never;
  };
}

/**
 * This is base interface for {@link BatchSpecificationWithoutBodyWithoutHandler} and {@link BatchSpecificationWithBodyWithoutHandler}.
 */
export interface BatchSpecificationWithMethodAndState<
  TStateInfo,
  TState,
  TMethod,
> {
  /**
   * The HTTP method required for the endpoint to trigger.
   */
  method: TMethod;

  /**
   * The {@link ep.EndpointStateInformation} representing the state/context required for the handler.
   */
  state: ep.EndpointStateInformation<TStateInfo, TState>;
}

/**
 * This interface contains necessary data for when BE endpoint needs to specify URL query parameters.
 */
export interface BatchSpecificationQueryArgs<
  TQueryData extends data.RuntimeAnyQuery,
  TStringDecoder,
> {
  /**
   * The {@link data.QueryValidatorSpec} specifying URL query parameter validation and metadata.
   */
  query: data.QueryValidatorSpec<TQueryData, TStringDecoder>;
}

/**
 * This interface contains necessary data for when BE endpoint needs to specify HTTP request header data.
 */
export interface BatchSpecificationHeaderArgs<
  THeaderData extends Record<string, unknown>,
  TStringDecoder,
> {
  /**
   * The {@link data.RequestHeaderDataValidatorSpec} specifying the HTTP request header validation and metadata.
   */
  headers: data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>;
}

/**
 * This interface contains necessary data for when BE endpoint needs to specify HTTP response header data.
 */
export interface BatchSpecificationResponseHeaderArgs<
  THeaderData extends Record<string, unknown>,
  TStringDecoder,
> {
  /**
   * The {@link data.ResponseHeaderDataValidatorSpec} specifying the HTTP response header validation and metadata.
   */
  responseHeaders: data.ResponseHeaderDataValidatorSpec<
    THeaderData,
    TStringDecoder
  >;
}

/**
 * This is base interface for {@link BatchSpecificationWithoutBodyWithoutHandler} and {@link BatchSpecificationWithBodyWithoutHandler}.
 */
export interface EndpointSpecArgsJustResponseBody<
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
> {
  /**
   * The {@link data.DataValidatorResponseOutputSpec} for HTTP response body, specifying validator and metadata.
   */
  output: data.DataValidatorResponseOutputSpec<TOutput, TOutputContentTypes>;
}

/**
 * This is base interface for {@link BatchSpecificationWithBodyWithoutHandler}.
 */
export interface EndpointSpecArgsJustBody<
  TInput,
  TInputContentTypes extends Record<string, unknown>,
> {
  /**
   * The {@link data.DataValidatorRequestInputSpec} for HTTP request body, specifying validator and metadata.
   */
  input: data.DataValidatorRequestInputSpec<TInput, TInputContentTypes>;
}

/**
 * This is base interface for {@link BatchSpecificationWithoutBody}, {@link BatchSpecificationWithBody}, {@link BatchSpecificationWithoutBodyWithHeaders}, and {@link BatchSpecificationWithBodyWithHeaders}.
 */
export interface EndpointSpecArgsWithHandler<
  TContext,
  TState,
  TEndpointArgs,
  TOutput,
> {
  /**
   * The callback to handle the request with validated inputs.
   * @see common.EndpointHandler
   */
  endpointHandler: common.EndpointHandler<
    TEndpointArgs & common.EndpointHandlerArgs<TContext, TState>,
    TOutput
  >;
}
