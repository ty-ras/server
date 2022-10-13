import type * as data from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";

export type BatchSpecificationWithoutBody<
  TContext,
  TStateInfo,
  TState,
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      never
    >
  >,
> = BatchSpecificationWithoutBodyWithoutHandler<
  TStateInfo,
  TState,
  TMethod,
  undefined,
  TOutput,
  TOutputContentTypes,
  TEndpointArgs,
  TMetadataProviders
> &
  EndpointSpecArgsWithHandler<TContext, TState, TEndpointArgs, TOutput>;

export type BatchSpecificationWithBody<
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
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> = BatchSpecificationWithBodyWithoutHandler<
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
> &
  EndpointSpecArgsWithHandler<
    TContext,
    TState,
    TEndpointArgs & common.EndpointHandlerArgsWithBody<TInput>,
    TOutput
  >;

export type BatchSpecificationWithoutBodyWithHeaders<
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
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      never
    >
  >,
> = BatchSpecificationWithoutBodyWithoutHandler<
  TStateInfo,
  TState,
  TMethod,
  THeaderData,
  TOutput,
  TOutputContentTypes,
  TEndpointArgs,
  TMetadataProviders
> &
  EndpointSpecArgsWithHandler<
    TContext,
    TState,
    TEndpointArgs,
    common.EndpointHandlerOutputWithHeaders<TOutput, THeaderData>
  > &
  BatchSpecificationResponseHeaderArgs<THeaderData, TStringDecoder>;

export type BatchSpecificationWithBodyWithHeaders<
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
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> = BatchSpecificationWithBodyWithoutHandler<
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
> &
  EndpointSpecArgsWithHandler<
    TContext,
    TState,
    TEndpointArgs & common.EndpointHandlerArgsWithBody<TInput>,
    common.EndpointHandlerOutputWithHeaders<TOutput, THeaderData>
  > &
  BatchSpecificationResponseHeaderArgs<THeaderData, TStringDecoder>;

export type BatchSpecificationWithoutBodyWithoutHandler<
  TStateInfo,
  TState,
  TMethod,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      never
    >
  >,
> = {
  method: TMethod;
  state: ep.EndpointStateValidator<TStateInfo, TState>;
} & EndpointSpecArgsWithoutBody<
  TEndpointArgs,
  TMetadataProviders,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes
>;

export type BatchSpecificationWithBodyWithoutHandler<
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
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
> = {
  method: TMethod;
  state: ep.EndpointStateValidator<TStateInfo, TState>;
} & EndpointSpecArgsWithBody<
  TEndpointArgs,
  TMetadataProviders,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes,
  TInput,
  TInputContentTypes
>;

export interface BatchSpecificationQueryArgs<
  TQueryData extends data.RuntimeAnyQuery,
  TStringDecoder,
> {
  query: data.QueryValidatorSpec<TQueryData, TStringDecoder>;
}

export interface BatchSpecificationHeaderArgs<
  THeaderData extends Record<string, unknown>,
  TStringDecoder,
> {
  headers: data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>;
}

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
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      unknown,
      unknown,
      any,
      any,
      TOutputContentTypes,
      never
    >
  >,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
> {
  output: data.DataValidatorResponseOutputSpec<TOutput, TOutputContentTypes>;
  mdArgs: {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
      infer TArg,
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
      unknown,
      infer _0,
      infer _1,
      TOutputContentTypes,
      never
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
  TEndpointArgs,
  TMetadataProviders extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      unknown,
      unknown,
      any,
      any,
      TOutputContentTypes,
      TInputContentTypes
    >
  >,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
> = EndpointSpecArgsJustBody<TInput, TInputContentTypes> & {
  output: data.DataValidatorResponseOutputSpec<TOutput, TOutputContentTypes>;
  mdArgs: {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
      infer TArg,
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
      unknown,
      infer _0,
      infer _1,
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