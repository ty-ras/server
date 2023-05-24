/**
 * @file This file contains code for "stage 1" builder. At this stage, it is possible to specify endpoint state specification, HTTP method, query, and request header data validation, in order to acquire "stage 2" builder.
 * It is also possible to specify all that information and request body validation in batch specification, to return "stage 3" builder.
 */
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as ep from "@ty-ras/endpoint";
import type * as common from "../common.types";
import type * as state from "./state.types";
import type * as batch from "../batch.types";
import {
  AppEndpointBuilderStage2,
  AppEndpointBuilderStage2WithBody,
  AppEndpointBuilderStage3,
} from ".";

/**
 * This class contains the endpoint builder at stage 1, which allows to:
 * - Specify HTTP method, query parameters, and request data validation, to return {@link AppEndpointBuilderStage2} and {@link AppEndpointBuilderStage2WithBody}.
 * - Specify all of the above along with request body validation via batch specification, to return {@link AppEndpointBuilderStage3}
 *
 * Instances of this class should not be created by client code, instead utilizing `startBuildingAPI` function to acquire "stage 0" builder and proceed from there.
 */
export class AppEndpointBuilderStage1<
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
  /**
   * Creates new instance of this class.
   *
   * This constructor should not be called by client code, instead utilizing `startBuildingAPI` function to acquire "stage 0" builder and proceed from there.
   * @param _state The current state of endpoint builder.
   */
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

  /**
   * This overload will create {@link AppEndpointBuilderStage2} without ability to specify request body, to continue building HTTP endpoint, with specified {@link data.HttpMethodWithoutBody} and endpoint state specification.
   * @param method The HTTP method used by HTTP endpoint being built.
   * @param endpointState The state specification used by HTTP endpoint being built.
   * @returns The {@link AppEndpointBuilderStage2}
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  public forMethod<TMethod extends TAllowedMethods, TState>(
    method: TMethod & data.HttpMethodWithoutBody,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
  ): AppEndpointBuilderStage2<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage2WithBody} with ability to specify request body, to continue building HTTP endpoint, with specified {@link data.HttpMethodWithBody} and endpoint state specification.
   * @param method The HTTP method used by HTTP endpoint being built.
   * @param endpointState The state specification used by HTTP endpoint being built.
   * @returns The {@link AppEndpointBuilderStage2WithBody}
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  public forMethod<TMethod extends TAllowedMethods, TState>(
    method: TMethod & data.HttpMethodWithBody,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
  ): AppEndpointBuilderStage2WithBody<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage2} without ability to specify request body, to continue building HTTP endpoint, with specified {@link data.HttpMethodWithoutBody}, endpoint state specification, and query parameter specification.
   * @param method The HTTP method used by HTTP endpoint being built.
   * @param endpointState The state specification used by HTTP endpoint being built.
   * @param query The query parameter specification.
   * @returns The {@link AppEndpointBuilderStage2}
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
  >(
    method: TMethod & data.HttpMethodWithoutBody,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
  ): AppEndpointBuilderStage2<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage2WithBody} with ability to specify request body, to continue building HTTP endpoint, with specified {@link data.HttpMethodWithBody}, endpoint state specification, and query specification.
   * @param method The HTTP method used by HTTP endpoint being built.
   * @param endpointState The state specification used by HTTP endpoint being built.
   * @param query The query parameter specification.
   * @returns The {@link AppEndpointBuilderStage2WithBody}
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
  >(
    method: TMethod & data.HttpMethodWithBody,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
  ): AppEndpointBuilderStage2WithBody<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage2} without ability to specify request body, to continue building HTTP endpoint, with specified {@link data.HttpMethodWithoutBody}, endpoint state specification, query parameter specification, and request header data specification.
   * @param method The HTTP method used by HTTP endpoint being built.
   * @param endpointState The state specification used by HTTP endpoint being built.
   * @param query The query parameter specification.
   * @param headers The request headers specification.
   * @returns The {@link AppEndpointBuilderStage2}
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    method: TMethod & data.HttpMethodWithoutBody,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
    headers: dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>,
  ): AppEndpointBuilderStage2<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage2WithBody} with ability to specify request body, to continue building HTTP endpoint, with specified {@link data.HttpMethodWithBody}, endpoint state specification, query specification, and request header specification.
   * @param method The HTTP method used by HTTP endpoint being built.
   * @param endpointState The state specification used by HTTP endpoint being built.
   * @param query The query parameter specification.
   * @param headers The request headers specification.
   * @returns The {@link AppEndpointBuilderStage2WithBody}
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  public forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    method: TMethod & data.HttpMethodWithBody,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder>,
    headers: dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>,
  ): AppEndpointBuilderStage2WithBody<
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

  /**
   * This is the implementation for all overloads of this method, creating {@link AppEndpointBuilderStage2} or {@link AppEndpointBuilderStage2WithBody} to continue building HTTP endpoint, with specified HTTP method, endpoint state specifciation, query specification, and request header specification.
   * @param method The {@link data.HttpMethod}.
   * @param endpointState The endpoint specification.
   * @param query The query parameter specification, if any.
   * @param headers The request header data specification, if any.
   * @returns The {@link AppEndpointBuilderStage2} or {@link AppEndpointBuilderStage2WithBody}, depending on the value of `method`.
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    method: TMethod,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
    query?: dataBE.QueryValidatorSpec<TQuery, TStringDecoder> | undefined,
    headers?:
      | dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>
      | undefined,
  ):
    | AppEndpointBuilderStage2<
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
    | AppEndpointBuilderStage2WithBody<
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

  /**
   * This is generic version of all variations of `forMethod` method, so that it could be invoked in generic way by `batchSpec` method.
   * It will create {@link AppEndpointBuilderStage2} or {@link AppEndpointBuilderStage2WithBody} to continue building HTTP endpoint, with specified HTTP method, endpoint state specifciation, query specification, and request header specification.
   * @param method The {@link data.HttpMethod}.
   * @param endpointState The endpoint specification.
   * @param query The query parameter specification, if any.
   * @param headers The request header data specification, if any.
   * @returns The {@link AppEndpointBuilderStage2} or {@link AppEndpointBuilderStage2WithBody}, depending on the value of `method`.
   * @throws The {@link InvalidMethodError} if the given `method` has been already specified for this URL.
   */
  private _forMethod<
    TMethod extends TAllowedMethods,
    TState,
    TQuery extends dataBE.RuntimeAnyQuery,
    THeaderData extends Record<string, unknown>,
  >(
    method: TMethod,
    endpointState: ep.EndpointStateInformation<TStateInfo, TState>,
    query: dataBE.QueryValidatorSpec<TQuery, TStringDecoder> | undefined,
    headers:
      | dataBE.RequestHeaderDataValidatorSpec<THeaderData, TStringDecoder>
      | undefined,
  ):
    | AppEndpointBuilderStage2<
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
    | AppEndpointBuilderStage2WithBody<
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

    const queryInfo: state.QueryInfo<
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

    const headerInfo: state.HeaderDataInfo<
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
      ? new AppEndpointBuilderStage2(
          this._state,
          endpointState,
          new Set([method]),
          queryInfo,
          headerInfo,
        )
      : new AppEndpointBuilderStage2WithBody(
          this._state,
          endpointState,
          new Set([method]),
          queryInfo,
          headerInfo,
        );
  }

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method and endpoint state specification.
   * @param spec The {@link batch.BatchSpecificationWithoutBody}, without values for request body, query parameters, request headers, nor response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithoutBody}, without values for request body, query parameters, nor response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and query parameters specifications.
   * @param spec The {@link batch.BatchSpecificationWithoutBody}, without values for request body, request headers, nor response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, query parameters, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithoutBody}, without values for request body or response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and request body specifications.
   * @param spec The {@link batch.BatchSpecificationWithBody}, without values for query parameters, request headers, nor response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, request body, and query parameters specifications.
   * @param spec The {@link batch.BatchSpecificationWithBody}, without values for request headers, nor response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, request body, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithBody}, without values for query parameters or response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, request body, query parameters, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithBody}, without values for response headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method and endpoint state.
   * @param spec The {@link batch.BatchSpecificationWithoutBodyWithHeaders}, without values for request body, query parameters, nor request headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithoutBodyWithHeaders}, without values for request body or query parameters.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and query parameters specifications.
   * @param spec The {@link batch.BatchSpecificationWithoutBodyWithHeaders}, without values for request body or request headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, query parameters, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithoutBodyWithHeaders}, without values for request body or query parameters specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and request body specifications.
   * @param spec The {@link batch.BatchSpecificationWithBodyWithHeaders}, without values for query parameters or request headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, and request body specifications.
   * @param spec The {@link batch.BatchSpecificationWithBodyWithHeaders}, without values for query parameters or request headers specifications.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, request body, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithBodyWithHeaders}, without values for query parameters.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This overload will create {@link AppEndpointBuilderStage3} for endpoint with specified HTTP method, endpoint state, request body, and request headers specifications.
   * @param spec The {@link batch.BatchSpecificationWithBodyWithHeaders}, without values for query parameters.
   */
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
  ): AppEndpointBuilderStage3<
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

  /**
   * This is implementation for all overloads to create {@link AppEndpointBuilderStage3} for given batch specification parameters.
   * @param spec The {@link batch.BatchSpecificationWithoutBody} or {@link BatchSpecificationWithBody} or {@link BatchSpecificationWithoutBodyWithHeaders} or {@link BatchSpecificationWithBodyWithHeaders}.
   * @returns The {@link AppEndpointBuilderStage3} to continue building HTTP endpoint(s).
   */
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
  ): AppEndpointBuilderStage3<
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
    if (
      builder instanceof AppEndpointBuilderStage2WithBody &&
      "input" in spec
    ) {
      // We have to do this explicit type annotation, otherwise compiler thinks that "builder" is of this type | AppEndpointBuilderForMethodsAndBody<any, any, any, any, any, any, any, any, any, any, any, any>
      const dummy1: AppEndpointBuilderStage2WithBody<
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
      > = builder;
      return "responseHeaders" in spec
        ? dummy1.withBody(
            spec.input,
            handlerWithHeaders(spec.endpointHandler, spec.responseHeaders),
            spec.output,
            spec.mdArgs,
          )
        : dummy1.withBody(
            spec.input,
            spec.endpointHandler,
            spec.output,
            spec.mdArgs,
          );
    } else {
      // Same thing here as above: need to do explicit type annotation, otherwise compiler gets confused.
      const dummy2: AppEndpointBuilderStage2<
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
      > = builder;
      return "responseHeaders" in spec
        ? dummy2.withoutBody(
            handlerWithHeaders(spec.endpointHandler, spec.responseHeaders),
            spec.output,
            spec.mdArgs,
          )
        : dummy2.withoutBody(spec.endpointHandler, spec.output, spec.mdArgs);
    }
  }
}

/**
 * This error is thrown by `forMethod` method by {@link AppEndpointBuilderStage1} when the given method has already been previously specified.
 */
export class InvalidMethodError extends Error {
  /**
   * Creates new instance of this class with given HTTP method.
   * @param method The HTTP method which was already specified.
   */
  public constructor(method: string) {
    super(`Invalid method specified: "${method}"`);
  }
}

const handlerWithHeaders = <
  TArgs,
  THandlerResult,
  THeaderData extends dataBE.RuntimeAnyHeaders,
  TStringEncoder,
>(
  handler: common.EndpointHandler<
    TArgs,
    common.EndpointHandlerOutputWithHeaders<THandlerResult, THeaderData>
  >,
  headers: dataBE.ResponseHeaderDataValidatorSpec<THeaderData, TStringEncoder>,
): common.EndpointHandlerSpec<
  TArgs,
  THandlerResult,
  THeaderData,
  TStringEncoder
> => ({
  handler,
  headers,
});
