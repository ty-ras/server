/**
 * @file This file contains types for defining one or more endpoints using ES decorators.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as ep from "@ty-ras/endpoint";
import type * as common from "./common.types";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

/**
 * This is function interface used to construct the {@link ApplicationEndpointsForURL}, which in turn is used to decorate the class methods which are handling BE endpoints.
 * The reason why this type exists is because it is created used [template literals](), and thus specifying additional arguments is feasible using the ``builder.url`/path/...` ``syntax.
 * The instances of this type should not be saved to variables, instead the function should be called immediately, and the {@link ApplicationEndpointsForURL} should be stored: ``const url = builder.url`/path/...`({...})``.
 * @see ApplicationEndpointsForURL
 */
export interface ApplicationEndpointsForURLFactory<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends common.TMetadataProvidersBase,
  TServerContext,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TEndpointSpecAdditionalData extends common.EndpointSpecAdditionalDataHKTBase,
  TURLData,
> {
  /**
   * Given the arguments for metadata providers, creates a {@link ApplicationEndpointsForURL} to be used to decorate class methods acting as BE endpoints.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param mdArgs Parameters for each of the metadata providers. Each parameter is related to this specific URL path pattern.
   * @returns A new {@link ApplicationEndpointsForURL} to be used to decorate class methods acting as BE endpoints.
   */
  (
    this: void,
    mdArgs: {
      [P in keyof TMetadataProviders]: md.MaterializeParameterWhenSpecifyingURL<
        TMetadataProviders[P],
        TProtoEncodedHKT,
        TURLData
      >;
    },
  ): ApplicationEndpointsForURL<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContext,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalData,
    TURLData
  >;
}

/**
 * This is function interface to start decorating class methods acting as BE endpoints.
 * The function returns {@link ClassMethodDecoratorFactory}, which then should be used to produce the final decorator for the method.
 * The {@link ClassMethodDecoratorFactory} acts as intermediate proxy in order to explicitly specify the protocol interface as generic argument in developer-friendly way, without specifying the rest of generic arguments explicitly.
 *
 * Instances of this interface are created by {@link ApplicationEndpointsForURLFactory}.
 */
export interface ApplicationEndpointsForURL<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends common.TMetadataProvidersBase,
  TServerContext,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TEndpointSpecAdditionalData extends common.EndpointSpecAdditionalDataHKTBase,
  TURLData,
> {
  /**
   * This function should be called by explicitly specifying the protocol interface, and optionally request and response body content types, as generic arguments.
   * The resulting {@link ClassMethodDecoratorFactory} can be then used to decorate the class method without further explicit generic argumnent specification.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param mdArgs Parameters for each of the metadata providers. Each parameter is related to this specific BE endpoint.
   * @returns The {@link ClassMethodDecoratorFactory} to be used to decorate the class methods.
   */
  <
    TProtocolSpec extends GetProtocolBaseForURLData<TURLData>,
    TResponseBodyContentType extends TAllResponseBodyContentTypes = TDefaultResponseBodyContentType,
    TRequestBodyContentType extends TAllRequestBodyContentTypes = TDefaultRequestBodyContentType,
  >(
    this: void,
    mdArgs: {
      [P in keyof TMetadataProviders]: md.MaterializeParameterWhenSpecifyingEndpoint<
        TMetadataProviders[P],
        TProtoEncodedHKT,
        TProtocolSpec,
        TRequestBodyContentType,
        TResponseBodyContentType
      >;
    },
  ): ClassMethodDecoratorFactory<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContext,
    TRequestBodyContentType,
    TResponseBodyContentType,
    TEndpointSpecAdditionalData,
    TProtocolSpec
  >;
}

/**
 * This is function interface to create the decorator for class methods acting as BE endpoints.
 *
 * Instances of this type are obtainable by {@link ApplicationEndpointsForURL}.
 */
export interface ClassMethodDecoratorFactory<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TServerContext,
  TRequestBodyContentType extends string,
  TResponseBodyContentType extends string,
  TEndpointSpecAdditionalData extends common.EndpointSpecAdditionalDataHKTBase,
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, unknown>,
> {
  /**
   * Creates the class method decorator with correct typing information as specified by protocol interface.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param spec The specification for the endpoint, containing information about query, request body, etc parameters as specified by protocol interface when using {@link ApplicationEndpointsForURL} when obtaining this function.
   * @returns The class decorator for the method, which should have correct input parameters and return type, as specified by protocol interface.
   */
  <TStateSpec extends dataBE.MaterializeStateSpecBase<TStateHKT>>(
    this: void,
    spec: GetEndpointSpec<
      TProtoEncodedHKT,
      TValidatorHKT,
      TRequestBodyContentType,
      TResponseBodyContentType,
      TEndpointSpecAdditionalData,
      TProtocolSpec,
      TStateSpec
    >,
  ): <This extends object>(
    method: MethodForEndpoint<
      GetMethodArgsGeneric<
        TStateHKT,
        TServerContext,
        TProtocolSpec,
        TStateSpec
      >,
      This,
      GetMethodReturnType<TProtocolSpec>
    >,
    context: ClassMethodDecoratorContext<This, typeof method>,
  ) => void;
}

/**
 * This is type for base type constraint of generic argument of {@link ApplicationEndpointsForURL}.
 */
export type GetProtocolBaseForURLData<TURLData> = protocol.ProtocolSpecCore<
  protocol.HttpMethod,
  any
> &
  (TURLData extends Record<string, unknown>
    ? protocol.ProtocolSpecURL<TURLData>
    : { [P in keyof protocol.ProtocolSpecURL<never>]: never });

/**
 * This is auxiliary type used by {@link ClassMethodDecoratorFactory} to define function signature type for method implementing BE endpoint specified by protocol interface.
 */
export type MethodForEndpoint<
  TArgs extends Record<string, any>,
  This,
  Return,
> = (this: This, args: TArgs) => ep.MaybePromise<Return>;

/**
 * This type defines all the necessary input required by TyRAS framework when declaring BE endpoint by using class method decorators.
 *
 * This type consists of {@link EndpointSpecBase} and {@link common.MaterializeEndpointSpecAdditionalData}.
 * Then, the additional types are combined to final result depending whether the given `TProtocolSpec` generic type argument extends the various additional specifications:
 * - {@link EndpointSpecQuery} if `TProtocolSpec` extends {@link protocol.ProtocolSpecQuery},
 * - {@link EndpointSpecRequestHeaders} if `TProtocolSpec` extends {@link protocol.ProtocolSpecHeaderData},
 * - {@link EndpointSpecRequestBody} if `TProtocolSpec` extends {@link protocol.ProtocolSpecRequestBody}, and
 * - {@link EndpointSpecResponseHeaders} if `TProtocolSpec` extends {@link protocol.ProtocolSpecResponseHeaders}.
 *
 * All the generic arguments except `TProtocolSpec` and `TStateSpec` come from the application builder and thus are fixed.
 * The BE endpoint itself can vary only those two generic arguments.
 */
export type GetEndpointSpec<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TRequestBodyContentType extends string,
  TResponseBodyContentType extends string,
  TEndpointSpecAdditionalData extends common.EndpointSpecAdditionalDataHKTBase,
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any>,
  TStateSpec,
> = EndpointSpecBase<
  TProtoEncodedHKT,
  TValidatorHKT,
  TResponseBodyContentType,
  TStateSpec,
  TProtocolSpec["method"],
  TProtocolSpec["responseBody"]
> &
  common.MaterializeEndpointSpecAdditionalData<
    TEndpointSpecAdditionalData,
    TProtocolSpec,
    TStateSpec
  > &
  (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
    ? EndpointSpecQuery<protocol.RuntimeOf<TQuery>, TValidatorHKT>
    : { [P in keyof EndpointSpecQuery<never, never>]?: never }) &
  (TProtocolSpec extends protocol.ProtocolSpecHeaderData<infer THeaderData>
    ? EndpointSpecRequestHeaders<protocol.RuntimeOf<THeaderData>, TValidatorHKT>
    : {
        [P in keyof EndpointSpecRequestHeaders<never, never>]?: never;
      }) &
  (TProtocolSpec extends protocol.ProtocolSpecRequestBody<infer TRequestBody>
    ? EndpointSpecRequestBody<
        protocol.RuntimeOf<TRequestBody>,
        TValidatorHKT,
        TRequestBodyContentType
      >
    : { [P in keyof EndpointSpecRequestBody<never, never, never>]?: never }) &
  (TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
    infer TResponseHeaderData
  >
    ? EndpointSpecResponseHeaders<
        protocol.RuntimeOf<TResponseHeaderData>,
        TValidatorHKT
      >
    : { [P in keyof EndpointSpecResponseHeaders<never, never>]?: never });

/**
 * This type defines the argument for class method which is acting as BE endpoint by decorating it using {@link ApplicationEndpointsForURL}.
 * It is meant to be used by other TyRAS types, and the client code is supposed to use {@link GetMethodArgs}.
 *
 * This type consists of static part containing the HTTP server context via `TServerContext` generic type argument and endpoint state via `TStateHKT` and `TStateSpec` generic type arguments.
 * Then, the additional types are combined to final result depending whether the given `TProtocolSpec` generic type argument extends the various additional specifications:
 * - The runtime type version of URL path parameters if `TProtocolSpec` extends {@link protocol.ProtocolSpecURL},
 * - The runtime type version of query parameters if `TProtocolSpec` extends {@link protocol.ProtocolSpecQuery},
 * - The runtime type version of request body if `TProtocolSpec` extends {@link protocol.ProtocolSpecRequestBody}, and
 * - The runtime type version of request headers parameters if `TProtocolSpec` extends {@link protocol.ProtocolSpecHeaderData}.
 * @see GetMethodArgs
 */
export type GetMethodArgsGeneric<
  TStateHKT extends dataBE.StateHKTBase,
  TServerContext,
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any>,
  TStateSpec,
> = {
  context: TServerContext;
  state: dataBE.MaterializeRuntimeState<TStateHKT, TStateSpec>;
} & (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
  ? { url: protocol.RuntimeOf<TURLData> }
  : {}) &
  (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
    ? { query: protocol.RuntimeOf<TQuery> }
    : {}) &
  (TProtocolSpec extends protocol.ProtocolSpecRequestBody<infer TRequestBody>
    ? { body: protocol.RuntimeOf<TRequestBody> }
    : {}) &
  (TProtocolSpec extends protocol.ProtocolSpecHeaderData<infer THeaderData>
    ? { headers: protocol.RuntimeOf<THeaderData> }
    : {});

/**
 * This type defines the argument for class method which is acting as BE endpoint by decorating it using {@link ApplicationEndpointsForURL}.
 * It is meant to be used by client code in the following way:
 * ```ts
 * import * as tyras from "@ty-ras/...";
 * import builder from "./file-defining-app-builder";
 *
 * const url = builder.url`/path/...`({...});
 *
 * export class EndpointsForURL {
 *   \@url<MyProtocol>({...})({...})
 *   public myEndpoint(args: tyras.GetMethodArgs<MyProtocol, typeof url>) {
 *     ...
 *   }
 * }
 * ```
 * @see GetMethodArgsGeneric
 */
export type GetMethodArgs<
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any>,
  TApp extends ApplicationEndpointsForURL<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
      ? TURLData
      : undefined
  >,
  TStateSpec,
> = TApp extends ApplicationEndpointsForURL<
  any,
  any,
  infer TStateHKT,
  any,
  infer TServerContext,
  any,
  any,
  any,
  any,
  any,
  any
>
  ? GetMethodArgsGeneric<TStateHKT, TServerContext, TProtocolSpec, TStateSpec>
  : never;

/**
 * This type defines the return type for class method which is acting as BE endpoint by decorating it using {@link ApplicationEndpointsForURL}.
 *
 * This type will be one of the following, depending on the `TProtocolSpec` generic type argument:
 * - The runtime type version of the response body as defined in `TProtocolSpec` if it does NOT extend {@link protocol.ProtocolSpecResponseHeaders}, or
 * - The {@link MethodReturnTypeFull} if the `TProtocolSpec` extends {@link protocol.ProtocolSpecResponseHeaders}.
 */
export type GetMethodReturnType<
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any>,
> = TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<any>
  ? MethodReturnTypeFull<TProtocolSpec>
  : protocol.RuntimeOf<TProtocolSpec["responseBody"]>;

/**
 * This type defines the return type for class method which is acting as BE endpoint by decorating it using {@link ApplicationEndpointsForURL}.
 * It is used when the `TProtocolSpec` extends {@link protocol.ProtocolSpecResponseHeaders}, or when the method is handled via internal callbacks.
 */
export interface MethodReturnTypeFull<
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any> &
    protocol.ProtocolSpecResponseHeaders<protocol.TResponseHeadersDataBase>,
> {
  /**
   * The response body object - the runtime type version of {@link protocol.ProtocolSpecCore.responseBody}.
   */
  body: protocol.RuntimeOf<TProtocolSpec["responseBody"]>;

  /**
   * The response headers object- the runtime type version of {@link protocol.ProtocolSpecResponseHeaders.responseHeaders}.
   */
  headers: protocol.RuntimeOf<TProtocolSpec["responseHeaders"]>;
}

/**
 * This is the 'static' type component of {@link GetEndpointSpec}.
 * Here, the 'static' means that it is not dependant on the protocol spec generic type argument `TProtocolSpec`.
 */
export interface EndpointSpecBase<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TResponseBodyContentType extends string,
  TStateSpec,
  TMethod,
  TResponseBody,
> {
  /**
   * The HTTP method required for the endpoint to trigger.
   */
  method: TMethod;

  /**
   * The state specification, as it is given to decorator.
   */
  state: TStateSpec;

  /**
   * The {@link dataBE.DataValidatorResponseOutputSpec} containing necessary runtime and metadata information about the BE endpoint return values to be serialized to HTTP response body.
   */
  responseBody: dataBE.DataValidatorResponseOutputSpec<
    protocol.RuntimeOf<TResponseBody>,
    protocol.EncodedOf<TProtoEncodedHKT, TResponseBody>,
    TValidatorHKT,
    TResponseBodyContentType
  >;
}

/**
 * This is the query parameter -specific component of {@link GetEndpointSpec}.
 * It is used when `TProtocolSpec` generic type argument extends {@link protocol.ProtocolSpecQuery}.
 */
export interface EndpointSpecQuery<
  TQueryData extends protocol.TQueryDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  /**
   * The {@link dataBE.QueryValidatorSpec} containing necessary runtime and metadata information about query parameters consumed by BE endpoint.
   */
  query: dataBE.QueryValidatorSpec<TQueryData, TValidatorHKT>;
}

/**
 * This is the request headers -specific component of {@link GetEndpointSpec}.
 * It is used when `TProtocolSpec` generic type argument extends {@link protocol.ProtocolSpecHeaderData}.
 */
export interface EndpointSpecRequestHeaders<
  TRequestHeadersData extends protocol.TRequestHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  /**
   * The {@link dataBE.RequestHeaderDataValidatorSpec} containing necessary runtime and metadata information about request headers consumed by BE endpoint as data.
   */
  headers: dataBE.RequestHeaderDataValidatorSpec<
    TRequestHeadersData,
    TValidatorHKT
  >;
}

/**
 * This is the response headers -specific component of {@link GetEndpointSpec}.
 * It is used when `TProtocolSpec` generic type argument extends {@link protocol.ProtocolSpecResponseHeaders}.
 */
export interface EndpointSpecResponseHeaders<
  TResponseHeadersData extends protocol.TResponseHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  /**
   * The {@link dataBE.ResponseHeaderDataValidatorSpec} containing necessary runtime and metadata information about response headers returned by BE endpoint.
   */
  responseHeaders: dataBE.ResponseHeaderDataValidatorSpec<
    TResponseHeadersData,
    TValidatorHKT
  >;
}

/**
 * This is the request body -specific component of {@link GetEndpointSpec}.
 * It is used when `TProtocolSpec` generic type argument extends {@link protocol.ProtocolSpecRequestBody}.
 */
export interface EndpointSpecRequestBody<
  TRequestBody,
  TValidatorHKT extends data.ValidatorHKTBase,
  TRequestBodyContentTypes extends string,
> {
  /**
   * The {@link dataBE.DataValidatorRequestInputSpec} containing necessary runtime and metadata information about request body consumed by BE endpoint.
   */
  requestBody: dataBE.DataValidatorRequestInputSpec<
    TRequestBody,
    TValidatorHKT,
    TRequestBodyContentTypes
  >;
}
