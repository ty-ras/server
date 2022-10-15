import * as ep from "@ty-ras/endpoint";
import * as dataBE from "@ty-ras/data-backend";
import * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";
import type * as state from "./state";
import { AppEndpointBuilderInitial } from ".";

export const startBuildingAPI = <TContext, TStateInfo>() =>
  new AppEndpointBuilderProvider<
    TContext,
    TStateInfo,
    unknown,
    unknown,
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  >({}, {}, []);

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
    private readonly _endpointMetadata: Array<
      state.EndpointMetadata<TStateInfo, TMetadataProviders>
    >,
  ) {}

  public atURL(fragments: TemplateStringsArray): AppEndpointBuilderInitial<
    TContext,
    TStateInfo,
    {}, // eslint-disable-line @typescript-eslint/ban-types
    ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public atURL<TArgs extends [string, ...Array<string>]>(
    fragments: TemplateStringsArray,
    ...args: TArgs
  ): URLDataNames<
    TContext,
    TStateInfo,
    TArgs[number],
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public atURL<TArgs extends [string, ...Array<string>]>(
    fragments: TemplateStringsArray,
    ...args: TArgs
  ):
    | AppEndpointBuilderInitial<
        TContext,
        TStateInfo,
        {}, // eslint-disable-line @typescript-eslint/ban-types
        ep.HttpMethod,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      >
    | URLDataNames<
        TContext,
        TStateInfo,
        TArgs[number],
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadataProviders
      > {
    if (args.length > 0) {
      // URL template has arguments -> return URL data validator which allows to build endpoints
      return {
        validateURLData: (validation) => {
          return new AppEndpointBuilderInitial({
            fragments,
            methods: {},
            // TODO fix this typing (may require extracting this method into class, as anonymous methods with method generic arguments don't behave well)
            metadata: this._mdProviders,
            urlValidation: {
              args,
              validation,
            },
            endpointMetadata: this._endpointMetadata,
          });
        },
      };
    } else {
      // URL has no arguments -> return builder which can build endpoints without URL validation
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new AppEndpointBuilderInitial({
        fragments,
        methods: {},
        metadata: this._mdProviders,
        urlValidation: undefined,
        endpointMetadata: this._endpointMetadata,
      });
    }
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
      infer _4,
      infer TNewHeaderDecoder,
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
      infer _5,
      infer TNewHeaderEncoder,
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
        infer _6,
        infer TNewOutputContents,
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
        infer _7,
        infer TNewInputContents,
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
      [],
    );
  }

  public getMetadataFinalResult(mdArgs: {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
      infer _0,
      infer _1, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _2, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _3, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _4,
      infer _5,
      infer _6,
      infer _7,
      infer TArg,
      infer _8
    >
      ? TArg
      : never;
  }): {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
      infer _0,
      infer _1, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _2, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _3, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _4, // eslint-disable-line @typescript-eslint/no-unused-vars
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
        this._endpointMetadata.map(({ metadata, stateInfo }) => ({
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
        infer _1, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _2, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _3, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _4, // eslint-disable-line @typescript-eslint/no-unused-vars
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

export interface URLDataNames<
  TContext,
  TStateInfo,
  TNames extends string,
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
  validateURLData: <
    TValidation extends {
      [P in TNames]: unknown;
    },
  >(
    validation: dataBE.URLParameterValidatorSpec<TValidation, TStringDecoder>,
  ) => AppEndpointBuilderInitial<
    TContext,
    TStateInfo,
    common.EndpointHandlerArgsWithURL<TValidation>,
    ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
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
