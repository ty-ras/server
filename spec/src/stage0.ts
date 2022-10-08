import * as ep from "@ty-ras/endpoint";
import * as dataBE from "@ty-ras/data-backend";
import * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";
import { AppEndpointBuilderInitial } from ".";

/**
 * This function begins the process of building AppEndpoints.
 * @param getInitialState The callback to get initial state from context.
 * @returns The `AppEndpointBuilderProvider` which can be used to refine URL and HTTP method parameters for the endpoint
 */
export const bindNecessaryTypes = <TContext, TState>(
  getInitialState: (ctx: TContext) => TState,
): AppEndpointBuilderProvider<
  TContext,
  TContext,
  TState,
  unknown,
  unknown,
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}
> =>
  new AppEndpointBuilderProvider(
    {
      validator: (ctx) => ({ error: "none", data: ctx }),
      getState: getInitialState,
    },
    {},
  );

// TODO use ContextHKT in these
export class AppEndpointBuilderProvider<
  TContext,
  TRefinedContext,
  TState,
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
    private readonly _contextTransform: dataBE.ContextValidatorSpec<
      TContext,
      TRefinedContext,
      TState
    >,
    private readonly _mdProviders: TMetadataProviders,
  ) {}

  public atURL(fragments: TemplateStringsArray): AppEndpointBuilderInitial<
    TContext,
    TRefinedContext,
    TState,
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
    TRefinedContext,
    TState,
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
        TRefinedContext,
        TState,
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
        TRefinedContext,
        TState,
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
            contextTransform: this._contextTransform,
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
        contextTransform: this._contextTransform,
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

  public refineContext<TNewContext, TNewState>(
    transform: dataBE.ContextValidatorSpec<
      TRefinedContext,
      TNewContext,
      TNewState
    >,
    mdArgs: {
      [P in keyof TMetadataProviders]: Parameters<
        TMetadataProviders[P]["withRefinedContext"]
      >[0];
    },
  ): AppEndpointBuilderProvider<
    TContext,
    TNewContext,
    TNewState,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    return new AppEndpointBuilderProvider(
      {
        ...transform,
        // TODO we can't use data.transitiveDataValidation here, because our error type is customized.
        // Extend the data.transitiveDataValidation so that it would also work for custom error types
        validator: (ctx) => {
          const transformed = this._contextTransform.validator(ctx);
          return transformed.error === "none"
            ? transform.validator(transformed.data)
            : transformed;
        },
      },
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
    TRefinedContext,
    TState,
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
    return new AppEndpointBuilderProvider(this._contextTransform, {
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
  TRefinedContext,
  TState,
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
    TRefinedContext,
    TState,
    common.EndpointHandlerArgsWithURL<TValidation>,
    ep.HttpMethod,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
}
