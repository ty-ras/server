import * as ep from "@ty-ras/endpoint";
import * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import * as common from "./common";
import type * as state from "./state";
import {
  AppEndpointBuilderForMethods,
  AppEndpointBuilderForMethodsAndBody,
  AppEndpointBuilder,
} from ".";

export class AppEndpointBuilderInitial<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL,
  TAllowedMethods extends ep.HttpMethod,
  THeaderDecoder,
  THeaderEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
  TMetadataProviders extends Record<
    string,
    // We must use 'any' as 2nd parameter, otherwise we won't be able to use AppEndpointBuilderInitial with specific TMetadataProviders type as parameter to functions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    md.MetadataBuilder<
      md.HKTArg,
      any,
      unknown,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  public constructor(
    protected readonly _state: state.AppEndpointBuilderState<
      TContext,
      TRefinedContext,
      TState,
      THeaderDecoder,
      THeaderEncoder,
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
    THeaderDecoder,
    THeaderEncoder,
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
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
  >(
    method: TMethods & ep.HttpMethodWithoutBody,
    query: data.QueryValidatorSpec<TQuery, THeaderDecoder>,
  ): AppEndpointBuilderForMethods<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public forMethod<
    TMethods extends TAllowedMethods,
    TQuery extends data.RuntimeAnyQuery,
  >(
    method: TMethods & ep.HttpMethodWithBody,
    query: data.QueryValidatorSpec<TQuery, THeaderDecoder>,
  ): AppEndpointBuilderForMethodsAndBody<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    TMethods,
    common.EndpointHandlerArgs<TRefinedContext, TState>,
    common.EndpointHandlerArgs<TRefinedContext, TState> &
      common.EndpointHandlerArgsWithQuery<TQuery>,
    THeaderDecoder,
    THeaderEncoder,
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
    query?: data.QueryValidatorSpec<TQuery, THeaderDecoder> | undefined,
    headers?:
      | data.RequestHeaderDataValidatorSpec<THeaderData, THeaderDecoder>
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
        THeaderDecoder,
        THeaderEncoder,
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
        THeaderDecoder,
        THeaderEncoder,
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
    query: data.QueryValidatorSpec<TQuery, THeaderDecoder> | undefined,
    headers:
      | data.RequestHeaderDataValidatorSpec<THeaderData, THeaderDecoder>
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
        THeaderDecoder,
        THeaderEncoder,
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
        THeaderDecoder,
        THeaderEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      > {
    const overlappingMehods = new Set(
      Object.keys(this._state.methods).filter(
        (existingMethod) => existingMethod === method,
      ),
    );
    if (overlappingMehods.size > 0) {
      throw new Error(
        `The methods ${Array.from(overlappingMehods).join(
          ", ",
        )} are already specified`,
      );
    }

    const queryInfo: common.QueryInfo<
      common.EndpointHandlerArgsWithQuery<TQuery>,
      THeaderDecoder
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
      THeaderDecoder
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
    spec: BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof (
        | BatchSpecificationQueryArgs<never, never>
        | BatchSpecificationHeaderArgs<never, never>
        | BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    THeaderData extends data.RuntimeAnyHeaders,
    TOutput,
  >(
    spec: BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof (
        | BatchSpecificationQueryArgs<never, never>
        | BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TQuery extends data.RuntimeAnyQuery,
    TOutput,
  >(
    spec: BatchSpecificationWithoutBody<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents
    > & {
      [P in keyof (
        | BatchSpecificationHeaderArgs<never, never>
        | BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & BatchSpecificationQueryArgs<TQuery, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithoutBody<
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
      [P in keyof BatchSpecificationResponseHeaderArgs<never, never>]?: never;
    } & BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder> &
      BatchSpecificationQueryArgs<TQuery, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithBody,
    TInput,
    TOutput,
  >(
    spec: BatchSpecificationWithBody<
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
        | BatchSpecificationQueryArgs<never, never>
        | BatchSpecificationHeaderArgs<never, never>
        | BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBody<
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
        | BatchSpecificationHeaderArgs<never, never>
        | BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & BatchSpecificationQueryArgs<TQuery, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBody<
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
        | BatchSpecificationQueryArgs<never, never>
        | BatchSpecificationResponseHeaderArgs<never, never>
      )]?: never;
    } & BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBody<
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
      [P in keyof BatchSpecificationResponseHeaderArgs<never, never>]?: never;
    } & BatchSpecificationQueryArgs<TQuery, THeaderDecoder> &
      BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public batchSpec<
    TMethod extends TAllowedMethods & ep.HttpMethodWithoutBody,
    TOutput,
    TResponseHeaderData extends data.RuntimeAnyHeaders,
  >(
    spec: BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      THeaderEncoder
    > & {
      [P in keyof (
        | BatchSpecificationQueryArgs<never, never>
        | BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      THeaderEncoder
    > & {
      [P in keyof BatchSpecificationQueryArgs<never, never>]?: never;
    } & BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithoutBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      THeaderEncoder
    > & {
      [P in keyof BatchSpecificationHeaderArgs<never, never>]?: never;
    } & BatchSpecificationQueryArgs<TQuery, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithoutBodyWithHeaders<
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
      THeaderEncoder
    > &
      BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder> &
      BatchSpecificationQueryArgs<TQuery, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      THeaderEncoder,
      TInput,
      TInputContents
    > & {
      [P in keyof (
        | BatchSpecificationQueryArgs<never, never>
        | BatchSpecificationHeaderArgs<never, never>
      )]?: never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithQuery<TQuery>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      THeaderEncoder,
      TInput,
      TInputContents
    > & {
      [P in keyof BatchSpecificationHeaderArgs<never, never>]?: never;
    } & BatchSpecificationQueryArgs<TQuery, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBodyWithHeaders<
      TRefinedContext,
      TState,
      TArgsURL & common.EndpointHandlerArgsWithHeaders<THeaderData>,
      TMetadataProviders,
      TMethod,
      TOutput,
      TOutputContents,
      TResponseHeaderData,
      THeaderEncoder,
      TInput,
      TInputContents
    > & {
      [P in keyof BatchSpecificationQueryArgs<never, never>]?: never;
    } & BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
    spec: BatchSpecificationWithBodyWithHeaders<
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
      THeaderEncoder,
      TInput,
      TInputContents
    > &
      BatchSpecificationQueryArgs<TQuery, THeaderDecoder> &
      BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
      | BatchSpecificationWithoutBody<
          TRefinedContext,
          TState,
          // TODO figure out non-any type which would not cause signature mismatch
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithoutBody,
          TOutput,
          TOutputContents
        >
      | BatchSpecificationWithBody<
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
      | BatchSpecificationWithoutBodyWithHeaders<
          TRefinedContext,
          TState,
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithoutBody,
          TOutput,
          TOutputContents,
          TResponseHeaderData,
          THeaderEncoder
        >
      | BatchSpecificationWithBodyWithHeaders<
          TRefinedContext,
          TState,
          any,
          TMetadataProviders,
          TMethod & ep.HttpMethodWithBody,
          TOutput,
          TOutputContents,
          TResponseHeaderData,
          THeaderEncoder,
          TInput,
          TInputContents
        >
    ) &
      // eslint-disable-next-line @typescript-eslint/ban-types
      ({} | BatchSpecificationQueryArgs<TQuery, THeaderDecoder>) &
      // eslint-disable-next-line @typescript-eslint/ban-types
      ({} | BatchSpecificationHeaderArgs<THeaderData, THeaderDecoder>),
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Omit<TAllowedMethods, TMethod> & ep.HttpMethod,
    THeaderDecoder,
    THeaderEncoder,
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
  THeaderDecoder,
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
  BatchSpecificationResponseHeaderArgs<THeaderData, THeaderDecoder>;

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
  THeaderDecoder,
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
  BatchSpecificationResponseHeaderArgs<THeaderData, THeaderDecoder>;

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
  THeaderDecoder,
> {
  headers: data.RequestHeaderDataValidatorSpec<THeaderData, THeaderDecoder>;
}

export interface BatchSpecificationResponseHeaderArgs<
  THeaderData extends Record<string, unknown>,
  THeaderDecoder,
> {
  responseHeaders: data.ResponseHeaderDataValidatorSpec<
    THeaderData,
    THeaderDecoder
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

export interface EndpointSpecArgsWithBody<
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
> {
  input: data.DataValidatorRequestInputSpec<TInput, TInputContentTypes>;
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
