import * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import * as common from "./common";

export type BatchSpecificationWithoutBody<
  TRefinedContext,
  TState,
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
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
> = BatchSpecificationWithoutBodyWithoutHandler<
  TEndpointArgs,
  TMetadataProviders,
  TMethod,
  undefined,
  TOutput,
  TOutputContentTypes
> &
  EndpointSpecArgsWithHandler<TRefinedContext, TState, TEndpointArgs, TOutput>;

export type BatchSpecificationWithBody<
  TRefinedContext,
  TState,
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
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
> = BatchSpecificationWithBodyWithoutHandler<
  TEndpointArgs,
  TMetadataProviders,
  TMethod,
  undefined,
  TOutput,
  TOutputContentTypes,
  TInput,
  TInputContentTypes
> &
  EndpointSpecArgsWithHandler<
    TRefinedContext,
    TState,
    TEndpointArgs & common.EndpointHandlerArgsWithBody<TInput>,
    TOutput
  >;

export type BatchSpecificationWithoutBodyWithHeaders<
  TRefinedContext,
  TState,
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
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringDecoder,
> = BatchSpecificationWithoutBodyWithoutHandler<
  TEndpointArgs,
  TMetadataProviders,
  TMethod,
  THeaderData,
  TOutput,
  TOutputContentTypes
> &
  EndpointSpecArgsWithHandler<
    TRefinedContext,
    TState,
    TEndpointArgs,
    common.EndpointHandlerOutputWithHeaders<TOutput, THeaderData>
  > &
  BatchSpecificationResponseHeaderArgs<THeaderData, TStringDecoder>;

export type BatchSpecificationWithBodyWithHeaders<
  TRefinedContext,
  TState,
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
  TMethod,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringDecoder,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
> = BatchSpecificationWithBodyWithoutHandler<
  TEndpointArgs,
  TMetadataProviders,
  TMethod,
  THeaderData,
  TOutput,
  TOutputContentTypes,
  TInput,
  TInputContentTypes
> &
  EndpointSpecArgsWithHandler<
    TRefinedContext,
    TState,
    TEndpointArgs & common.EndpointHandlerArgsWithBody<TInput>,
    common.EndpointHandlerOutputWithHeaders<TOutput, THeaderData>
  > &
  BatchSpecificationResponseHeaderArgs<THeaderData, TStringDecoder>;

export type BatchSpecificationWithoutBodyWithoutHandler<
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
  TMethod,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
> = {
  method: TMethod;
} & EndpointSpecArgsWithoutBody<
  TEndpointArgs,
  TMetadataProviders,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes
>;

export type BatchSpecificationWithBodyWithoutHandler<
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
  TMethod,
  TResponseHeaders,
  TOutput,
  TOutputContentTypes extends Record<string, unknown>,
  TInput,
  TInputContentTypes extends Record<string, unknown>,
> = {
  method: TMethod;
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
  TRefinedContext,
  TState,
  TEndpointArgs,
  TOutput,
> {
  endpointHandler: common.EndpointHandler<
    TEndpointArgs & common.EndpointHandlerArgs<TRefinedContext, TState>,
    TOutput
  >;
}
