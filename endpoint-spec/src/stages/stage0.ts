/**
 * @file This file contains code for "stage 0" builder. At this stage, it is possible to specify metadata providers being used, as well as create final metadata. By specifyng URL parameters, it is possible to acquire "stage 1" builder.
 */

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as common from "../common.types";
import { AppEndpointBuilderStage1 } from "./";

/**
 * This class contains the endpoint builder at stage 0, which allows to:
 * - Specify metadata providers
 * - Create final metadata object from endpoints passed to this class.
 * - Specify URL parameters to return {@link AppEndpointBuilderStage1}.
 *
 * Instances of this class should not be created by client code, instead utilizing `startBuildingAPI` function.
 */
export class AppEndpointBuilderStage0<
  TContext,
  TStateInfo,
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
   * @param _mdProviders The metadata providers.
   * @param _mdStateExtractors The callbacks to extract state information from metadata.
   */
  public constructor(
    private readonly _mdProviders: TMetadataProviders,
    private readonly _mdStateExtractors: {
      [P in keyof TMetadataProviders]: StateExtractor<
        TStateInfo,
        TMetadataProviders[P]
      >;
    },
  ) {}

  /**
   * This is [template literal tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to be used to specify the parameters embedded into URL path of the HTTP endpoint.
   * @param fragments The string fragments of of the URL parameter specification.
   * @param args The URL path parameter specifications as embedded within invocation, must be instances of {@link URLParameterInfo}.
   * @returns The next stage builder {@link AppEndpointBuilderStage1}
   * @example
   * ```ts
   * import * as t from "io-ts";
   * import * as tyras from "@ty-ras/backend-node-io-ts-openapi";
   *
   * tyras
   *   // Create instance of this class
   *   .startBuildingAPI()
   *   // Invoke this method
   *   .atURL`/path/with/${tyras.urlParameter("parameter", t.string))}`
   *   // Continue using the return value of this method
   *   .continueUsingBuilder(...)
   * ```
   */
  public atURL<
    TArgs extends Array<URLParameterInfo<string, any, TStringDecoder>>,
  >(
    fragments: TemplateStringsArray,
    ...args: TArgs
  ): AppEndpointBuilderStage1<
    TContext,
    TStateInfo,
    TArgs extends []
      ? {}
      : common.EndpointHandlerArgsWithURL<URLParameterReducer<TArgs>>,
    data.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    return new AppEndpointBuilderStage1({
      fragments,
      methods: {},
      metadata: this._mdProviders,
      urlValidation:
        args.length > 0
          ? {
              args: args.map(({ name }) => name),
              validation: {
                validators: Object.fromEntries(
                  args.map(({ name, validator }) => [name, validator] as const),
                ) as dataBE.StringDataValidators<
                  URLParameterReducer<TArgs>,
                  string,
                  true
                >,
                metadata: Object.fromEntries(
                  args.map(
                    ({
                      name,
                      decoder,
                      regExp,
                    }): [
                      string,
                      dataBE.URLParameterValidationAdditionalMetadata &
                        dataBE.WithDecoder<TStringDecoder>,
                    ] => [name, { decoder, regExp }],
                  ),
                ) as dataBE.StringDataValidatorSpecMetadata<
                  keyof URLParameterReducer<TArgs> & string,
                  dataBE.WithDecoder<TStringDecoder> &
                    dataBE.URLParameterValidationAdditionalMetadata
                >,
              },
            }
          : undefined,
    });
  }

  /**
   * Adds a new {@link md.MetadataProvider} to available providers, returning new instance of this same class.
   * @param metadataKind A freeform identifier of the metadata provider to be added.
   * @param metadataProvider The {@link md.MetadataProvider} to add.
   * @param stateExtractor The callback to extract state information from the metadata.
   * @returns A new instance of this class, but with given metadata provided added to available metadata providers.
   */
  public withMetadataProvider<
    TMetadataKind extends string,
    TMetadataProvider extends md.MetadataProvider<
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
    >,
  >(
    metadataKind: TMetadataKind,
    metadataProvider: TMetadataProvider,
    stateExtractor: StateExtractor<TStateInfo, TMetadataProvider>,
  ): AppEndpointBuilderStage0<
    TContext,
    TStateInfo,
    TMetadataProvider extends md.MetadataProvider<
      infer _0,
      infer _1,
      infer _2,
      infer TNewHeaderDecoder,
      infer _4,
      infer _5,
      infer _6,
      infer _7,
      infer _8,
      infer _9
    >
      ? TNewHeaderDecoder
      : never,
    TMetadataProvider extends md.MetadataProvider<
      infer _0,
      infer _1,
      infer _2,
      infer _4,
      infer TNewHeaderEncoder,
      infer _5,
      infer _6,
      infer _7,
      infer _8,
      infer _9
    >
      ? TNewHeaderEncoder
      : never,
    TOutputContents &
      (TMetadataProvider extends md.MetadataProvider<
        infer _0,
        infer _1,
        infer _2,
        infer _4,
        infer _5,
        infer TNewOutputContents,
        infer _6,
        infer _7,
        infer _8,
        infer _9
      >
        ? TNewOutputContents
        : never),
    TInputContents &
      (TMetadataProvider extends md.MetadataProvider<
        infer _0,
        infer _1,
        infer _2,
        infer _4,
        infer _5,
        infer _6,
        infer TNewInputContents,
        infer _7,
        infer _8,
        infer _9
      >
        ? TNewInputContents
        : never),
    TMetadataProviders & { [P in TMetadataKind]: TMetadataProvider }
  > {
    return new AppEndpointBuilderStage0(
      {
        ...this._mdProviders,
        [metadataKind]: metadataProvider,
      },
      { ...this._mdStateExtractors, [metadataKind]: stateExtractor } as {
        [P in keyof (TMetadataProviders & {
          [x: string]: TMetadataProvider;
        })]: StateExtractor<
          TStateInfo,
          (TMetadataProviders & { [x: string]: TMetadataProvider })[P]
        >;
      },
    );
  }

  /**
   * Creates a final metadata object, using available metadata providers, for given {@link common.AppEndpointMetadataResult}s.
   * @param mdArgs The arguments needed to create the final metadata object.
   * @param endpoints The endpoints to create metadata object for.
   * @returns The final metadata object.
   */
  public getMetadataFinalResult(
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
        infer _0,
        infer _1,
        infer _2,
        infer _3,
        infer _4,
        infer _5,
        infer _6,
        infer _7,
        infer TArg,
        infer _8
      >
        ? TArg
        : never;
    },
    endpoints: ReadonlyArray<
      common.AppEndpointMetadataResult<
        TStateInfo,
        {
          [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
            infer _,
            infer _1,
            infer TEndpointMD,
            infer _2,
            infer _3,
            infer _4,
            infer _5,
            infer _6,
            infer _7,
            infer _8
          >
            ? TEndpointMD
            : never;
        }
      >
    >,
  ): {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
      infer _0,
      infer _1,
      infer _2,
      infer _3,
      infer _4,
      infer _5,
      infer _6,
      infer _7,
      infer _8,
      infer TResult
    >
      ? TResult
      : never;
  } {
    return data.transformEntries(this._mdProviders, (md, key) =>
      md.createFinalMetadata(
        mdArgs[key],
        endpoints.map(({ metadata, stateInfo }) => ({
          md: metadata[key],
          stateMD: Object.entries(stateInfo).reduce(
            (dict, [method, stateInfo]) => {
              dict[method as never] = this._mdStateExtractors[key](stateInfo);
              return dict;
            },
            {} as Record<string, unknown>,
          ),
        })),
      ),
    ) as {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
        infer _0,
        infer _1,
        infer _2,
        infer _3,
        infer _4,
        infer _5,
        infer _6,
        infer _7,
        infer _8,
        infer TResult
      >
        ? TResult
        : never;
    };
  }
}

/**
 * Helper type to create callback using 8th generic argument of given {@link md.MetadataProvider}.
 */
export type StateExtractor<TStateInfo, TMetadataProvider> =
  TMetadataProvider extends md.MetadataProvider<
    infer _0,
    infer _1,
    infer _2,
    infer _3,
    infer _4,
    infer _5,
    infer _6,
    infer TStateMD,
    infer _7,
    infer _8
  >
    ? (stateInfo: TStateInfo) => TStateMD
    : never;

/**
 * This interface contains necessary information about one parameter embedded in URL path string.
 */
export interface URLParameterInfo<TName extends string, TRuntime, TDecoder> {
  /**
   * The name of the parameter.
   */
  name: TName;
  /**
   * The 'native' decoder of paramter (io-ts/zod/runtypes/etc).
   */
  decoder: TDecoder;
  /**
   * The TyRAS {@link data.DataValidator} callback invoking the `decoder`.
   */
  validator: data.DataValidator<string, TRuntime>;

  /**
   * The {@link RegExp} for URL path parameter.
   */
  regExp: RegExp;
}

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
        (Head extends URLParameterInfo<infer TName, infer TRuntime, infer _>
          ? Record<TName, TRuntime>
          : {})
    >
  : Readonly<Result>;
