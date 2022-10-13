import * as ep from "@ty-ras/endpoint";
import * as dataBE from "@ty-ras/data-backend";
import * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";
import { AppEndpointBuilderInitial } from ".";

export const startBuildingAPI = <TContext>() =>
  new AppEndpointBuilderProvider<
    TContext,
    unknown,
    unknown,
    unknown,
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  >(() => undefined, {});

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
    private readonly _stateProvider: common.StateProvider<TContext, TStateInfo>,
    private readonly _mdProviders: TMetadataProviders,
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
    {
      [P in keyof TMetadataProviders]: ReturnType<
        TMetadataProviders[P]["getBuilder"]
      >;
    }
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
    {
      [P in keyof TMetadataProviders]: ReturnType<
        TMetadataProviders[P]["getBuilder"]
      >;
    }
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
        {
          [P in keyof TMetadataProviders]: ReturnType<
            TMetadataProviders[P]["getBuilder"]
          >;
        }
      >
    | URLDataNames<
        TContext,
        TStateInfo,
        TArgs[number],
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        {
          [P in keyof TMetadataProviders]: ReturnType<
            TMetadataProviders[P]["getBuilder"]
          >;
        }
      > {
    if (args.length > 0) {
      // URL template has arguments -> return URL data validator which allows to build endpoints
      return {
        validateURLData: (validation) => {
          return new AppEndpointBuilderInitial({
            stateProvider: this._stateProvider,
            fragments,
            methods: {},
            // TODO fix this typing (may require extracting this method into class, as anonymous methods with method generic arguments don't behave well)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            metadata: data.transformEntries(this._mdProviders, (md) =>
              md.getBuilder(),
            ) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            urlValidation: {
              args,
              validation,
            },
          });
        },
      };
    } else {
      // URL has no arguments -> return builder which can build endpoints without URL validation
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new AppEndpointBuilderInitial({
        stateProvider: this._stateProvider,
        fragments,
        methods: {},
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        metadata: data.transformEntries(this._mdProviders, (md) =>
          md.getBuilder(),
        ) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        urlValidation: undefined,
      });
    }
  }

  public changeStateProvider<TNewStateInfo>(
    newStateProvider: common.StateProvider<TContext, TNewStateInfo>,
    mdArgs: {
      [P in keyof TMetadataProviders]: Parameters<
        TMetadataProviders[P]["withRefinedContext"]
      >[0];
    },
  ): AppEndpointBuilderProvider<
    TContext,
    TNewStateInfo,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    return new AppEndpointBuilderProvider(
      newStateProvider,
      data.transformEntries(this._mdProviders, (provider, key) =>
        provider.withRefinedContext(mdArgs[key]),
      ) as TMetadataProviders,
    );
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
  ): AppEndpointBuilderProvider<
    TContext,
    TStateInfo,
    TMetadataProvider extends md.MetadataProvider<
      infer _,
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
      infer _,
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
        infer _,
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
        infer _,
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
    return new AppEndpointBuilderProvider(this._stateProvider, {
      ...this._mdProviders,
      [metadataKind]: metadataProvider,
    });
  }

  public getMetadataFinalResult(
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
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
    },
    endpoints: ReadonlyArray<{
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _1, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer TEndpointMD,
        infer _2, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _3, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _4, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _5,
        infer _6,
        infer _7,
        infer _8
      >
        ? Array<TEndpointMD>
        : never;
    }>,
  ): {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
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
        endpoints.flatMap((ep) => ep[key]),
      ),
    ) as {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProvider<
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
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
  TMetadataProviders extends common.MetadataBuilderBase<
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
