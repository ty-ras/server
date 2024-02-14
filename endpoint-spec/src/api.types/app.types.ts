/**
 * @file This file contains type definitions for builder, which allows creation of {@link ep.AppEndpoint}s in controllable and maintainable way.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as ep from "@ty-ras/endpoint";
import type * as common from "./common.types";
import type * as url from "./url.types";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars */

/**
 * This builder can be used for two main purposes:
 * - Create a new {@link url.ApplicationEndpointsForURLFactory} via {@link url} function to use it to mark endpoint-handling methods with ES decorators, and
 * - Create a final set of {@link ep.AppEndpoint}s via {@link createEndpoints} function to act as HTTP REST API, and served by TyRAS server.
 *
 * Additionally, this interface has a few auxiliary helper functions to make life easier for users.
 * Furthermore, it is possible to alter the internal settings of this builder:
 * - change metadata providers via {@link resetMetadataProviders} function, and
 * - change additional endpoint specification data via {@link changeEndpointSpecAdditionalData} function.
 * @see url.ApplicationEndpointsForURLFactory
 */
export interface ApplicationBuilderGeneric<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends common.TMetadataProvidersBase,
  TServerContextPossible,
  TServerContextArg,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TEndpointSpecAdditionalDataHKT extends common.EndpointSpecAdditionalDataHKTBase,
> {
  /**
   * This is [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) function which should be invoked like this:
   * ```ts
   * builder.url`/path/${someParameter}/suffix`
   * ```
   *
   * To specify URL path parameters, use `urlParameter` function of TyRAS framework.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param fragments The string portions of the template literal.
   * @param args The non-string portions of the template literal.
   * @returns A new {@link url.ApplicationEndpointsForURLFactory} to be used to decorate class methods using ES decorators.
   */
  url: <TArgs extends TURLTemplateLiteralArgsBase<TValidatorHKT>>(
    this: void,
    fragments: TemplateStringsArray,
    ...args: TArgs
  ) => url.ApplicationEndpointsForURLFactory<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContextArg,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT,
    GetURLData<TValidatorHKT, TArgs>
  >;

  /**
   * Creates {@link EndpointsCreationResult} containing the array of {@link ep.AppEndpoint} along with metadata about all the given endpoints.
   * The {@link ep.AppEndpoint}s can be used to create TyRAS HTTP server to serve them.
   *
   * The `endpoints` parameters should contain at least one {@link EndpointCreationArg} parameter, which can be either
   * - directly class or instance of class containing methods decorated using {@link url.ApplicationEndpointsForURLFactory} obtained via {@link url} function of this builder, or
   * - an object where keys are URL path prefixes as strings, and values recursively another {@link EndpointCreationArg}s.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param mdArgs The arguments for metadata providers that this builder is using.
   * @param endpoints At least one {@link EndpointCreationArg}.
   * @returns An {@link EndpointsCreationResult} containing the array of {@link ep.AppEndpoint} along with metadata about all the given endpoints.
   * @see EndpointCreationArg
   * @see EndpointsCreationResult
   */
  createEndpoints: (
    this: void,
    mdArgs: {
      [P in keyof TMetadataProviders]: md.MaterializeParameterWhenCreatingEndpoints<
        TMetadataProviders[P]
      >;
    },
    ...endpoints: [EndpointCreationArg, ...Array<EndpointCreationArg>]
  ) => EndpointsCreationResult<
    TMetadataProviders,
    TServerContextArg,
    dataBE.MaterializeStateInfo<
      TStateHKT,
      dataBE.MaterializeStateSpecBase<TStateHKT>
    >
  >;

  /**
   * This is auxiliary helper function to construct {@link dataBE.DataValidatorRequestInputSpec}s with default parameters that this builder is configured with.
   * @see AppRequestBodyCreator
   */
  requestBody: AppRequestBodyCreator<
    TValidatorHKT,
    TDefaultRequestBodyContentType
  >;

  /**
   * This is self-transforming function to create new {@link ApplicationBuilder} with different generic arguments.
   * This particular function will change the metadata providers of the resulting builder.
   * All other parameters will remain the same.
   * @see ResetMetadataProviders
   */
  resetMetadataProviders: ResetMetadataProviders<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContextPossible,
    TServerContextArg,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT
  >;

  /**
   * This is self-transforming function to create new {@link ApplicationBuilder} with different generic arguments.
   * This particular function will change the additional data [higher-kinded type (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) extending the {@link common.EndpointSpecAdditionalDataHKTBase}.
   * All other parameters will remain the same.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param endpointMethodProcessor The callback to potentially modify each of the method that is decorated using {@link url.ApplicationEndpointsForURLFactory} returned by {@link url} function of this builder.
   * @returns A new {@link ApplicationBuilder} with modified behaviour.
   */
  changeEndpointSpecAdditionalData: <
    TNewEndpointSpecAdditionalDataHKT extends common.EndpointSpecAdditionalDataHKTBase,
  >(
    this: void,
    endpointMethodProcessor: EndpointMethodProcessor<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TServerContextArg,
      TAllRequestBodyContentTypes,
      TAllResponseBodyContentTypes,
      TNewEndpointSpecAdditionalDataHKT
    >,
  ) => ApplicationBuilderGeneric<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContextPossible,
    TServerContextArg,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TNewEndpointSpecAdditionalDataHKT
  >;

  /**
   * Returns value indicating whether the raw server context will be passed to endpoint methods of this builder.
   * @returns will return `true` if context is visible for endpoint methods; `false` otherwise.
   */
  isContextVisibleToEndpoints: () => boolean;

  /**
   * Returns new instance of {@link ApplicationBuilderGeneric} which allows endpoints to see raw server context.
   * @returns The {@link ApplicationBuilderGeneric}
   */
  showContextToEndpoints: () => ApplicationBuilderGeneric<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContextPossible,
    TServerContextPossible,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT
  >;

  /**
   * Returns new instance of {@link ApplicationBuilderGeneric} which disallows endpoints to see raw server context.
   * @returns The {@link ApplicationBuilderGeneric}
   */
  hideContextForEndpoints: () => ApplicationBuilderGeneric<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContextPossible,
    never,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT
  >;
}

/**
 * This is the base type for he arguments given to template literal function.
 * @see ApplicationBuilderGeneric.url
 */
export type TURLTemplateLiteralArgsBase<
  TValidatorHKT extends data.ValidatorHKTBase,
> = Array<dataBE.URLParameterInfo<string, any, TValidatorHKT>>;

/**
 * Helper type to extract the shape of the URL parameters from the arguments given to template literal function.
 * @see ApplicationBuilderGeneric.url
 */
export type GetURLData<
  TValidatorHKT extends data.ValidatorHKTBase,
  TArgs extends TURLTemplateLiteralArgsBase<TValidatorHKT>,
> = TArgs extends [] ? undefined : URLParameterReducer<TArgs>;

/**
 * Helper type to extract final type of URL parameters, given an array of {@link URLParameterInfo} objects.
 * Modified from [StackOverflow](https://stackoverflow.com/questions/69085499/typescript-convert-tuple-type-to-object).
 */
export type URLParameterReducer<
  Arr extends Array<unknown>,
  Result extends Record<string, unknown> = {},
> = Arr extends []
  ? Result
  : Arr extends [infer Head, ...infer Tail]
  ? URLParameterReducer<
      [...Tail],
      Result &
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (Head extends dataBE.URLParameterInfo<
          infer TName,
          infer TRuntime,
          infer _
        >
          ? { [P in TName]: TRuntime }
          : {})
    >
  : Readonly<Result>;

/**
 * This type contains two function signatures for one function {@link ApplicationBuilderGeneric.resetMetadataProviders}.
 */
export interface ResetMetadataProviders<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TServerContextPossible,
  TServerContextArg,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TEndpointSpecAdditionalDataHKT extends common.EndpointSpecAdditionalDataHKTBase,
> {
  /**
   * This function overload will create new {@link ApplicationBuilder} without metadata providers.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @returns A new {@link ApplicationBuilder} with no metadata providers.
   */
  (this: void): ApplicationBuilderGeneric<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    {},
    TServerContextPossible,
    TServerContextArg,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT
  >;

  /**
   * This function overload will create new {@link ApplicationBuilder} with given metadata providers.
   * The existing metadata providers will NOT be present in new returned {@link ApplicationBuilder}, unless they were also specified in `providers` parameter.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param providers The named metadata providers.
   * @returns A new {@link ApplicationBuilder} with given metadata providers.
   */
  <TNewMetadataProviders extends common.TMetadataProvidersBase>(
    this: void,
    providers: {
      [P in keyof TNewMetadataProviders]: md.MetadataProvider<
        TProtoEncodedHKT,
        TValidatorHKT,
        TStateHKT,
        TNewMetadataProviders[P]
      >;
    },
  ): ApplicationBuilderGeneric<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TNewMetadataProviders,
    TServerContextPossible,
    TServerContextArg,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT
  >;
}

/**
 * This type is used as argument for {@link ApplicationBuilder.createEndpoints}.
 * It represents the `component` part of the [composite pattern](https://en.wikipedia.org/wiki/Composite_pattern).
 * @see EndpointCreationArgLeaf
 * @see EndpointCreationArgNode
 */
export type EndpointCreationArg =
  | EndpointCreationArgLeaf
  | EndpointCreationArgNode;

/**
 * This type is part of {@link EndpointCreationArg}.
 * Its role is `leaf` in the [composite pattern](https://en.wikipedia.org/wiki/Composite_pattern).
 *
 * The leaf is one or many objects, all either classes or instances of classes containing methods decorated using {@link url.ApplicationEndpointsForURLFactory} obtained via {@link ApplicationBuilder.url}.
 * Classes should be used if decorated methods are `static`.
 * Otherwise instances of classes should be created using `new` operator.
 * @see EndpointCreationArgLeafSingle
 */
export type EndpointCreationArgLeaf =
  data.OneOrMany<common.EndpointCreationArgLeafSingle>;

/**
 * This type is part of {@link EndpointCreationArg}.
 * Its role is `composite` in the [composite pattern](https://en.wikipedia.org/wiki/Composite_pattern).
 *
 * The composition is achieved not by array, but instead by a record object.
 * The keys are URL path prefixes as strings.
 * The values are {@link EndpointCreationArg}s.
 */
export interface EndpointCreationArgNode {
  [urlPrefix: string]: EndpointCreationArg;
}

/**
 * This is return type of {@link ApplicationBuilder.createEndpoints}, binding together the created {@link ep.AppEndpoint}s, and metadata objects.
 */
export type EndpointsCreationResult<
  TMetadataProviders extends common.TMetadataProvidersBase,
  TContext,
  TStateInfo,
> = {
  /**
   * The endpoints that can be further used to run TyRAS HTTP server.
   */
  endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>;

  /**
   * The metadata objects produced by metadata providers of {@link ApplicationBuilder}.
   */
  metadata: {
    [P in keyof TMetadataProviders]: md.MaterializeReturnWhenCreatingEndpoints<
      TMetadataProviders[P]
    >;
  };
};

/**
 * This is helper type to extract the state specification base type constraint given instance of {@link ApplicationBuilder}.
 * Then, the state specifications can be defined as:
 * ```ts
 * const myStateSpec = ... as const satisfies tyras.StateSpecBaseOfAppBuilder<typeof app>;
 * ```
 */
export type StateSpecBaseOfAppBuilder<
  TApp extends
    | ApplicationBuilderGeneric<
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
        any
      >
    | ApplicationBuilderGeneric<
        any,
        any,
        any,
        any,
        any,
        never,
        any,
        any,
        any,
        any,
        any
      >,
> = TApp extends ApplicationBuilderGeneric<
  any,
  any,
  infer TStateHKT,
  any,
  any,
  infer _,
  any,
  any,
  any,
  any,
  any
>
  ? dataBE.MaterializeStateSpecBase<TStateHKT>
  : never;

/**
 * This type contains two function signatures for one function {@link ApplicationBuilder.requestBody}.
 */
export interface AppRequestBodyCreator<
  TValidatorHKT extends data.ValidatorHKTBase,
  TDefaultRequestBodyContentType extends string,
> {
  /**
   * Creates new {@link dataBE.DataValidatorRequestInputSpec} with default parameters of {@link ApplicationBuilder} and given decoder.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param decoder The 'native' decoder (io-ts/zod/runtypes/etc validator) to deserialize request body.
   * @returns The {@link dataBE.DataValidatorRequestInputSpec} that can be used when decorating methods using {@link url.ApplicationEndpointsForURLFactory}.
   */
  <TRequestBody>(
    this: void,
    decoder: data.MaterializeDecoder<TValidatorHKT, TRequestBody>,
  ): dataBE.DataValidatorRequestInputSpec<
    TRequestBody,
    TValidatorHKT,
    TDefaultRequestBodyContentType
  >;

  /**
   * Creates new {@link dataBE.DataValidatorRequestInputSpec} with default parameters of {@link ApplicationBuilder} and given decoder and request body content type.
   * @param this The `this` parameter is `void` to prevent using "this" in implementations.
   * @param decoder The 'native' decoder (io-ts/zod/runtypes/etc validator) to deserialize request body.
   * @param contentType The request body content type.
   * @returns The {@link dataBE.DataValidatorRequestInputSpec} that can be used when decorating methods using {@link url.ApplicationEndpointsForURLFactory}.
   */
  <TRequestBody, TRequestBodyContentType extends string>(
    this: void,
    decoder: data.MaterializeDecoder<TValidatorHKT, TRequestBody>,
    contentType: TRequestBodyContentType,
  ): dataBE.DataValidatorRequestInputSpec<
    TRequestBody,
    TValidatorHKT,
    TRequestBodyContentType
  >;
}

/**
 * This is callback type used when changing the additional data [higher-kinded type (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) extending the {@link common.EndpointSpecAdditionalDataHKTBase}.
 * This callback allows customizing the method being decorated, using additional data specified by the HKT.
 *
 * If the HKT makes it mandatory for endpoints requiring authentication, to also specify permission specification, then this callback would modify the given this-bound method to invoke permission check before actually passing control to the original method.
 * @see ApplicationBuilder.changeEndpointSpecAdditionalData
 */
export type EndpointMethodProcessor<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TServerContext,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TEndpointSpecAdditionalDataHKT extends common.EndpointSpecAdditionalDataHKTBase,
> = <
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, unknown>,
  TStateSpec extends dataBE.MaterializeStateSpecBase<TStateHKT>,
  TRequestBodyContentType extends TAllRequestBodyContentTypes,
  TResponseBodyContentType extends TAllResponseBodyContentTypes,
>(
  this: void,
  args: {
    spec: url.GetEndpointSpec<
      TProtoEncodedHKT,
      TValidatorHKT,
      TRequestBodyContentType,
      TResponseBodyContentType,
      TEndpointSpecAdditionalDataHKT,
      TProtocolSpec,
      TStateSpec
    >;
    boundMethod: url.MethodForEndpoint<
      url.GetMethodArgsGeneric<
        TStateHKT,
        TServerContext,
        TProtocolSpec,
        TStateSpec
      >,
      void,
      url.GetMethodReturnType<TProtocolSpec>
    >;
  },
) => void | url.MethodForEndpoint<
  url.GetMethodArgsGeneric<
    TStateHKT,
    TServerContext,
    TProtocolSpec,
    TStateSpec
  >,
  void,
  url.GetMethodReturnType<TProtocolSpec>
>;
