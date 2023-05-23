import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as ep from "@ty-ras/endpoint";
import * as common from "./common";
import type * as state from "./state.types";
import type * as batch from "./batch.types";
import {
  AppEndpointBuilderForMethods,
  AppEndpointBuilderForMethodsAndBody,
  AppEndpointBuilder,
} from ".";

export class AppEndpointBuilderInitial<
  TContext,
  TStateInfo,
  TArgsURL extends object,
  TAllowedMethods extends data.HttpMethod,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends common.MetadataProvidersBase<
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents
  >,
> {
  public constructor(
    protected readonly _state: state.AppEndpointBuilderState<
      TContext,
      TStateInfo,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    >,
  ) {}

  public forMethod<TMethod extends TAllowedMethods, TState>(
    method: TMethod & data.HttpMethodWithoutBody,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
  ): AppEndpointBuilderForMethods<
    TContext,
    TStateInfo,
    TState,
    TArgsURL,
    TMethod,
    common.EndpointHandlerArgs<TContext, TState>,
    common.EndpointHandlerArgs<TContext, TState>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<TMethod extends TAllowedMethods, TState>(
    method: TMethod & data.HttpMethodWithBody,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TStateInfo,
    TState,
    TArgsURL,
    TMethod,
    common.EndpointHandlerArgs<TContext, TState>,
    common.EndpointHandlerArgs<TContext, TState>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
  >(
    method: TMethod & data.HttpMethodWithoutBody,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
  ): AppEndpointBuilderForMethods<
    TContext,
    TStateInfo,
    TState,
    TArgsURL,
    TMethod,
    common.EndpointHandlerArgs<TContext, TState>,
    common.EndpointHandlerArgs<TContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
  >(
    method: TMethod & data.HttpMethodWithBody,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TStateInfo,
    TState,
    TArgsURL,
    TMethod,
    common.EndpointHandlerArgs<TContext, TState>,
    common.EndpointHandlerArgs<TContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    method: TMethod & data.HttpMethodWithoutBody,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
    headers: dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>,
  ): AppEndpointBuilderForMethods<
    TContext,
    TStateInfo,
    TState,
    TArgsURL,
    TMethod,
    common.EndpointHandlerArgs<TContext, TState> &
      common.EndpointHandlerArgsWithHeaders<THeaderData>,
    common.EndpointHandlerArgs<TContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    method: TMethod & data.HttpMethodWithBody,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
    headers: dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TStateInfo,
    TState,
    TArgsURL,
    TMethod,
    common.EndpointHandlerArgs<TContext, TState> &
      common.EndpointHandlerArgsWithHeaders<THeaderData>,
    common.EndpointHandlerArgs<TContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    method: TMethod,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
    query?: dataBE.QueryValidatorSpec<TQuery, TStringDecoder> | undefined,
    headers?:
      | dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>
      | undefined,
  ):
    | AppEndpointBuilderForMethods<
        TContext,
        TStateInfo,
        TState,
        TArgsURL,
        TMethod,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      >
    | AppEndpointBuilderForMethodsAndBody<
        TContext,
        TStateInfo,
        TState,
        TArgsURL,
        TMethod,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      > {
    return this._forMethod(method, endpointState, query, headers);
  }

  private _forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends Record<string, unknown>,
  >(
    method: TMethod,
    endpointState: ep.EndpointStateValidator<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder> | undefined,
    headers:
      | dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>
      | undefined,
  ):
    | AppEndpointBuilderForMethods<
        TContext,
        TStateInfo,
        TState,
        TArgsURL,
        TMethod,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      >
    | AppEndpointBuilderForMethodsAndBody<
        TContext,
        TStateInfo,
        TState,
        TArgsURL,
        TMethod,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      > {
    const overlappingMethods = new Set(
      Object.keys(this._state.methods).filter(
        (existingMethod) => existingMethod === method,
      ),
    );
    if (overlappingMethods.size > 0) {
      throw new InvalidMethodError(method);
    }

    const queryInfo: common.QueryInfo<
      common.EndpointHandlerArgsWithQuery<TQuery>,
      TStringDecoder
    > = {
      getEndpointArgs: (q) =>
        query
          ? { query: q as TQuery }
          : // Fugly, but has to do for now.
            ({} as common.EndpointHandlerArgsWithQuery<TQuery>),
    };
    if (query) {
      queryInfo.query = query;
    }

    const headerInfo: common.HeaderDataInfo<
      common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TStringDecoder
    > = {
      getEndpointArgs: (h) =>
        headers
          ? { headers: h as THeaderData }
          : ({} as common.EndpointHandlerArgsWithHeaders<THeaderData>),
    };
    if (headers) {
      headerInfo.headers = headers;
    }

    return data.isMethodWithoutRequestBody(method)
      ? new AppEndpointBuilderForMethods(
          this._state,
          endpointState,
          new Set([method]),
          queryInfo,
          headerInfo,
        )
      : new AppEndpointBuilderForMethodsAndBody(
          this._state,
          endpointState,
          new Set([method]),
          queryInfo,
          headerInfo,
        );
  }

  public batchSpec<TMethod extends TAllowedMethods, TState, TOutput>(
    spec: batch.BatchSpecificationWithoutBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TArgsURL,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TArgsURL &
        common.EndpointHandlerArgsWithQuery<TQuery> &
        common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder> &
      batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents,
      TArgsURL,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TQuery extends dataBE.RuntimeAnyQuery,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents,
      TArgsURL &
        common.EndpointHandlerArgsWithHeaders<THeaderData> &
        common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders
    > & {
      [P in keyof batch.BatchSpecificationResponseHeaderArgs<
        never,
        never
      >]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder> &
      batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TArgsURL,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationQueryArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.EndpointSpecArgsJustBody<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TArgsURL &
        common.EndpointHandlerArgsWithQuery<TQuery> &
        common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders
    > & {
      [P in keyof batch.EndpointSpecArgsJustBody<never, never>]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder> &
      batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    TInput,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents,
      TArgsURL,
      TMetadataProviders
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    TInput,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders
    > & {
      [P in keyof batch.BatchSpecificationHeaderArgs<never, never>]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TInput,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders
    > & {
      [P in keyof batch.BatchSpecificationQueryArgs<never, never>]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & data.HttpMethodWithBody,
    TState,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TQuery extends dataBE.RuntimeAnyQuery,
    TInput,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents,
      TArgsURL &
        common.EndpointHandlerArgsWithHeaders<THeaderData> &
        common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders
    > &
      batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder> &
      batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
    TInput,
    TOutput,
    TResponseHeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    spec: (
      | batch.BatchSpecificationWithoutBody<
          TContext,
          TStateInfo,
          TState,
          TMethod & data.HttpMethodWithoutBody,
          TOutput,
          TOutputContents,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          TMetadataProviders
        >
      | batch.BatchSpecificationWithBody<
          TContext,
          TStateInfo,
          TState,
          TMethod & data.HttpMethodWithBody,
          TOutput,
          TOutputContents,
          TInput,
          TInputContents,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          TMetadataProviders
        >
      | batch.BatchSpecificationWithoutBodyWithHeaders<
          TContext,
          TStateInfo,
          TState,
          TMethod & data.HttpMethodWithoutBody,
          TOutput,
          TOutputContents,
          TResponseHeaderData,
          TStringEncoder,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          TMetadataProviders
        >
      | batch.BatchSpecificationWithBodyWithHeaders<
          TContext,
          TStateInfo,
          TState,
          TMethod & data.HttpMethodWithBody,
          TOutput,
          TOutputContents,
          TResponseHeaderData,
          TStringEncoder,
          TInput,
          TInputContents,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          TMetadataProviders
        >
    ) &
      // eslint-disable-next-line @typescript-eslint/ban-types
      ({} | batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>) &
      // eslint-disable-next-line @typescript-eslint/ban-types
      ({} | batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>),
  ): AppEndpointBuilder<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<TAllowedMethods, TMethod> & data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const builder = this._forMethod(
      spec.method,
      spec.state,
      "query" in spec ? spec.query : undefined,
      "headers" in spec ? spec.headers : undefined,
    );
    return builder instanceof AppEndpointBuilderForMethodsAndBody &&
      "input" in spec
      ? "responseHeaders" in spec
        ? builder.withBody(
            spec.input,
            common.handlerWithHeaders(
              spec.endpointHandler,
              spec.responseHeaders,
            ),
            spec.output,
            spec.mdArgs,
          )
        : builder.withBody(
            spec.input,
            spec.endpointHandler,
            spec.output,
            spec.mdArgs,
          )
      : "responseHeaders" in spec
      ? builder.withoutBody(
          common.handlerWithHeaders(spec.endpointHandler, spec.responseHeaders),
          spec.output,
          spec.mdArgs,
        )
      : builder.withoutBody(spec.endpointHandler, spec.output, spec.mdArgs);
  }
}

export class InvalidMethodError extends Error {
  public constructor(method: string) {
    super(`Invalid method specified: "${method}"`);
  }
}
