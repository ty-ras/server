import * as ep from "@ty-ras/endpoint";
import * as data from "@ty-ras/data-backend";
import * as common from "./common";
import type * as state from "./state";
import type * as batch from "./batch";
import {
  AppEndpointBuilderForMethods,
  AppEndpointBuilderForMethodsAndBody,
  AppEndpointBuilder,
} from ".";

export class AppEndpointBuilderInitial<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL extends object,
  TAllowedMethods extends ep.HttpMethod,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
  TMetadataProviders extends common.MetadataBuilderBase<
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents
  >,
> {
  public constructor(
    protected readonly _state: state.AppEndpointBuilderState<
      TContext,
      TRefinedContext,
      TState,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    >,
  ) {}

  public forMethod<TMethods extends TAllowedMethods>(
    method: TMethods & ep.HttpMethodWithoutBody,
  ): AppEndpointBuilderForMethods<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<TMethods extends TAllowedMethods>(
    method: TMethods & ep.HttpMethodWithBody,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
  >(
    method: TMethods & ep.HttpMethodWithoutBody,
    query: data.QueryValidatorSpec<TQuery, TStringDecoder>,
  ): AppEndpointBuilderForMethods<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
  >(
    method: TMethods & ep.HttpMethodWithBody,
    query: data.QueryValidatorSpec<TQuery, TStringDecoder>,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends data.RuntimeAnyHeaders,
  >(
    method: TMethods & ep.HttpMethodWithoutBody,
    query: data.QueryValidatorSpec<TQuery, TStringDecoder>,
    headers: data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>,
  ): AppEndpointBuilderForMethods<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithHeaders<THeaderData>,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends data.RuntimeAnyHeaders,
  >(
    method: TMethods & ep.HttpMethodWithBody,
    query: data.QueryValidatorSpec<TQuery, TStringDecoder>,
    headers: data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithHeaders<THeaderData>,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends data.RuntimeAnyHeaders,
  >(
    method: TMethods,
    query?: data.QueryValidatorSpec<TQuery, TStringDecoder> | undefined,
    headers?:
      | data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>
      | undefined,
  ):
    | AppEndpointBuilderForMethods<
        TContext,
        TRefinedContext,
        TState,
        TArgsURL,
        TMethods,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      >
    | AppEndpointBuilderForMethodsAndBody<
        TContext,
        TRefinedContext,
        TState,
        TArgsURL,
        TMethods,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      > {
    return this._forMethod(method, query, headers);
  }

  private _forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends Record<string, unknown>,
  >(
    method: TMethods,
    query: data.QueryValidatorSpec<TQuery, TStringDecoder> | undefined,
    headers:
      | data.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>
      | undefined,
  ):
    | AppEndpointBuilderForMethods<
        TContext,
        TRefinedContext,
        TState,
        TArgsURL,
        TMethods,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithQuery<TQuery>,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      >
    | AppEndpointBuilderForMethodsAndBody<
        TContext,
        TRefinedContext,
        TState,
        TArgsURL,
        TMethods,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
        | common.EndpointHandlerArgsWithHeaders<THeaderData>,
        | common.EndpointHandlerArgs<TRefinedContext, TState>
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
      throw new Error(
        `The methods ${Array.from(overlappingMethods).join(
          ", ",
        )} are already specified`,
      );
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

    return ep.isMethodWithoutRequestBody(method)
      ? new AppEndpointBuilderForMethods(
          this._state,
          new Set([method]),
          queryInfo,
          headerInfo,
        )
      : new AppEndpointBuilderForMethodsAndBody(
          this._state,
          new Set([method]),
          queryInfo,
          headerInfo,
        );
  }

  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TQuery extends data.RuntimeAnyQuery,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends data.RuntimeAnyHeaders,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL &
        common.EndpointHandlerArgsWithQuery<TQuery> &
        common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof batch.BatchSpecificationResponseHeaderArgs<
        never,
        never
      >]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder> &
      batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    TQuery extends data.RuntimeAnyQuery,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationHeaderArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TQuery extends data.RuntimeAnyQuery,
    TInput,
    TOutput,
  >(
    spec: batch.BatchSpecificationWithBody<
      TRefinedContext,
      TState,
      TArgsURL &
        common.EndpointHandlerArgsWithHeaders<THeaderData> &
        common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TInput,
      TInputContents
    > & {
      [P in keyof batch.BatchSpecificationResponseHeaderArgs<
        never,
        never
      >]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder> &
      batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder
    > & {
      [P in keyof batch.BatchSpecificationQueryArgs<never, never>]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TQuery extends data.RuntimeAnyQuery,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder
    > & {
      [P in keyof batch.BatchSpecificationHeaderArgs<never, never>]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends data.RuntimeAnyHeaders,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL &
        common.EndpointHandlerArgsWithQuery<TQuery> &
        common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder
    > &
      batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder> &
      batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    TInput,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents
    > & {
      [P in keyof (
        | batch.BatchSpecificationQueryArgs<never, never>
        | batch.BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    TQuery extends data.RuntimeAnyQuery,
    TInput,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents
    > & {
      [P in keyof batch.BatchSpecificationHeaderArgs<never, never>]?: never;
    } & batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TInput,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents
    > & {
      [P in keyof batch.BatchSpecificationQueryArgs<never, never>]?: never;
    } & batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TQuery extends data.RuntimeAnyQuery,
    TInput,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: batch.BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL &
        common.EndpointHandlerArgsWithHeaders<THeaderData> &
        common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      TStringEncoder,
      TInput,
      TInputContents
    > &
      batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder> &
      batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
    THeaderData extends data.RuntimeAnyHeaders,
    TInput,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: (
      | batch.BatchSpecificationWithoutBody<
          TRefinedContext,
          TState,
          // TODO figure out non-any type which would not cause signature mismatch
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithoutBody,
          TOutput,
          TOutputContents
        >
      | batch.BatchSpecificationWithBody<
          TRefinedContext,
          TState,
          // TODO figure out non-any type which would not cause signature mismatch
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithBody,
          TOutput,
          TOutputContents,
          TInput,
          TInputContents
        >
      | batch.BatchSpecificationWithoutBodyWithHeaders<
          TRefinedContext,
          TState,
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithoutBody,
          TOutput,
          TOutputContents,
          TResponseHeaderData,
          TStringEncoder
        >
      | batch.BatchSpecificationWithBodyWithHeaders<
          TRefinedContext,
          TState,
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithBody,
          TOutput,
          TOutputContents,
          TResponseHeaderData,
          TStringEncoder,
          TInput,
          TInputContents
        >
    ) &
      // eslint-disable-next-line @typescript-eslint/ban-types
      ({} | batch.BatchSpecificationQueryArgs<TQuery, TStringDecoder>) &
      // eslint-disable-next-line @typescript-eslint/ban-types
      ({} | batch.BatchSpecificationHeaderArgs<THeaderData, TStringDecoder>),
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const builder = this._forMethod(
      spec.method,
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
