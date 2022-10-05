import * as ep from "@ty-ras/endpoint";
import * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";

export interface AppEndpointBuilderState<
  TContext,
  TRefinedContext,
  TState,
  THeaderDecoder,
  THeaderEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
  TMetadata extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      unknown,
      unknown,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  fragments: TemplateStringsArray;
  methods: Partial<
    Record<
      ep.HttpMethod,
      StaticAppEndpointBuilderSpec<
        TContext,
        THeaderDecoder,
        THeaderEncoder,
        TOutputContents,
        TInputContents,
        TMetadata
      >
    >
  >;
  contextTransform: data.ContextValidatorSpec<
    TContext,
    TRefinedContext,
    TState
  >;
  metadata: TMetadata;
  urlValidation: URLValidationInfo<THeaderDecoder>;
}

export type URLValidationInfo<TStringDecoder> =
  | {
      args: ReadonlyArray<string>;
      validation: data.URLParameterValidatorSpec<
        data.RuntimeAnyURLData,
        TStringDecoder
      >;
    }
  | undefined;

export interface StaticAppEndpointBuilderSpec<
  TContext,
  THeaderDecoder,
  THeaderEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
  TMetadata extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      unknown,
      unknown,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  builder: StaticAppEndpointBuilder<TContext>;
  requestHeadersSpec?: data.RequestHeaderDataValidatorSpecMetadata<
    string,
    THeaderDecoder
  >;
  responseHeadersSpec?: data.ResponseHeaderDataValidatorSpecMetadata<
    string,
    THeaderEncoder
  >;
  queryValidation?: data.QueryDataValidatorSpecMetadata<string, THeaderDecoder>;
  inputValidation?: Omit<
    data.DataValidatorRequestInputSpec<unknown, TInputContents>,
    "validator"
  >;
  outputValidation: Omit<
    data.DataValidatorResponseOutputSpec<unknown, TOutputContents>,
    "validator"
  >;
  mdArgs: {
    [P in keyof TMetadata]: TMetadata[P] extends md.MetadataBuilder<
      infer TArg,
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _1, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer _2,
      infer _3,
      infer _4,
      infer _5
    >
      ? md.Kind<
          TArg,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>,
          Record<string, unknown>
        >
      : never;
  };
}

export type StaticAppEndpointBuilder<TContext> = (
  groupNamePrefix: string,
  // groups: Record<string, string>,
) => ep.StaticAppEndpointHandler<TContext>;
