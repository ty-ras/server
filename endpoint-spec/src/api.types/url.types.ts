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

export type GetProtocolBaseForURLData<TURLData> = protocol.ProtocolSpecCore<
  protocol.HttpMethod,
  any
> &
  (TURLData extends Record<string, unknown>
    ? protocol.ProtocolSpecURL<TURLData>
    : {});

export type MethodForEndpoint<
  TArgs extends Record<string, any>,
  This,
  Return,
> = (this: This, args: TArgs) => ep.MaybePromise<Return>;

export type ClassMethodDecoratorFactory<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TServerContext,
  TRequestBodyContentType extends string,
  TResponseBodyContentType extends string,
  TEndpointSpecAdditionalData extends common.EndpointSpecAdditionalDataHKTBase,
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, unknown>,
> = <TStateSpec extends dataBE.MaterializeStateSpecBase<TStateHKT>>(
  spec: GetEndpointSpec<
    TProtoEncodedHKT,
    TValidatorHKT,
    TRequestBodyContentType,
    TResponseBodyContentType,
    TEndpointSpecAdditionalData,
    TProtocolSpec,
    TStateSpec
  >,
) => <This extends object>(
  method: MethodForEndpoint<
    DefineMethodArgsGeneric<
      TStateHKT,
      TServerContext,
      TProtocolSpec,
      TStateSpec
    >,
    This,
    GetMethodReturnType<TProtocolSpec>
  >,
  context: ClassMethodDecoratorContext<
    This,
    MethodForEndpoint<
      DefineMethodArgsGeneric<
        TStateHKT,
        TServerContext,
        TProtocolSpec,
        TStateSpec
      >,
      This,
      GetMethodReturnType<TProtocolSpec>
    >
  >,
) => void;

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

export type DefineMethodArgsGeneric<
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
  ? DefineMethodArgsGeneric<
      TStateHKT,
      TServerContext,
      TProtocolSpec,
      TStateSpec
    >
  : never;

export type GetMethodReturnType<
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any>,
> = TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<any>
  ? MethodReturnTypeFull<TProtocolSpec>
  : protocol.RuntimeOf<TProtocolSpec["responseBody"]>;

export interface MethodReturnTypeFull<
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, any> &
    protocol.ProtocolSpecResponseHeaders<protocol.TResponseHeadersDataBase>,
> {
  body: protocol.RuntimeOf<TProtocolSpec["responseBody"]>;
  headers: protocol.RuntimeOf<TProtocolSpec["responseHeaders"]>;
}

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
   * The {@link ep.EndpointStateInformation} representing the state/context required for the handler.
   */
  state: TStateSpec;

  responseBody: dataBE.DataValidatorResponseOutputSpec<
    protocol.RuntimeOf<TResponseBody>,
    protocol.EncodedOf<TProtoEncodedHKT, TResponseBody>,
    TValidatorHKT,
    TResponseBodyContentType
  >;
}

export interface EndpointSpecQuery<
  TQueryData extends protocol.TQueryDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  query: dataBE.QueryValidatorSpec<TQueryData, TValidatorHKT>;
}

export interface EndpointSpecRequestHeaders<
  TRequestHeadersData extends protocol.TRequestHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  headers: dataBE.RequestHeaderDataValidatorSpec<
    TRequestHeadersData,
    TValidatorHKT
  >;
}

export interface EndpointSpecResponseHeaders<
  TResponseHeadersData extends protocol.TResponseHeadersDataBase,
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  responseHeaders: dataBE.ResponseHeaderDataValidatorSpec<
    TResponseHeadersData,
    TValidatorHKT
  >;
}

export interface EndpointSpecRequestBody<
  TRequestBody,
  TValidatorHKT extends data.ValidatorHKTBase,
  TRequestBodyContentTypes extends string,
> {
  requestBody: dataBE.DataValidatorRequestInputSpec<
    TRequestBody,
    TValidatorHKT,
    TRequestBodyContentTypes
  >;
}
