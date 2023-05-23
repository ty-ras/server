/**
 * @file This file contains types related to specifying endpoints in batch style via single interface, as opposed to using builder pattern.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type * as data from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";

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
    EndpointSpecArgsWithoutBody<
      TResponseHeaders,
      TOutput,
      TOutputContentTypes,
      TEndpointArgs,
      TMetadataProviders
    > {}

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
    EndpointSpecArgsWithBody<
      TResponseHeaders,
      TOutput,
      TOutputContentTypes,
      TInput,
      TInputContentTypes,
      TEndpointArgs,
      TMetadataProviders
    > {}

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
   * The {@link ep.EndpointStateValidator} representing the state/context required for the handler.
   */
  state: ep.EndpointStateValidator<TStateInfo, TState>;
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
  headers: data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>;
}

/**
 * This interface contains necessary data for when BE endpoint needs to specify HTTP response header data.
 */
export interface BatchSpecificationResponseHeaderArgs<
  THeaderData extends Record<string, unknown>,
  TStringDecoder,
> {
  responseHeaders: data.ResponseHeaderDataValidatorSpec<
    THeaderData,
    TStringDecoder
  >;
}

export interface EndpointSpecArgsWithoutBody<
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      any,
      any,
      any,
      any,
      TOutputContentTypes,
      any
    >
  >,
> {
  output: data.DataValidatorResponseOutputSpec<TOutput, TOutputContentTypes>;
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

export type EndpointSpecArgsWithBody<
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
      any,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> = EndpointSpecArgsJustBody<TInput, TInputContentTypes> & {
  output: data.DataValidatorResponseOutputSpec<TOutput, TOutputContentTypes>;
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
};

export interface EndpointSpecArgsJustBody<
  TInput,
  TInputContentTypes extends Record<string, unknown>,
> {
  input: data.DataValidatorRequestInputSpec<TInput, TInputContentTypes>;
}

export interface EndpointSpecArgsWithHandler<
  TContext,
  TState,
  TEndpointArgs,
  TOutput,
> {
  endpointHandler: common.EndpointHandler<
    TEndpointArgs & common.EndpointHandlerArgs<TContext, TState>,
    TOutput
  >;
}
