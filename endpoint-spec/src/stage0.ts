/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";
import { AppEndpointBuilderInitial } from ".";

export const startBuildingAPI = <TContext, TStateInfo>() =>
  new AppEndpointBuilderProvider<
    TContext,
    TStateInfo,
    unknown,
    unknown,
    {},
    {},
    {}
  >({}, {});

export class AppEndpointBuilderProvider<
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
  public constructor(
    private readonly _mdProviders: TMetadataProviders,
    private readonly _mdStateExtractors: {
      [P in keyof TMetadataProviders]: StateExtractor<
        TStateInfo,
        TMetadataProviders[P]
      >;
    },
  ) {}

  public atURL<
    TArgs extends Array<URLParameterInfo<string, any, TStringDecoder>>,
  >(
    fragments: TemplateStringsArray,
    ...args: TArgs
  ): AppEndpointBuilderInitial<
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
    return new AppEndpointBuilderInitial({
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
  ): AppEndpointBuilderProvider<
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
    return new AppEndpointBuilderProvider(
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

export interface URLParameterInfo<TName extends string, TRuntime, TDecoder> {
  name: TName;
  decoder: TDecoder;
  validator: data.DataValidator<string, TRuntime>;
  regExp: RegExp;
}

// Tuple reducer spotted from https://stackoverflow.com/questions/69085499/typescript-convert-tuple-type-to-object
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
