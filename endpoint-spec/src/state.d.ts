import * as ep from "@ty-ras/endpoint";
import * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";

export interface AppEndpointBuilderState<
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
  TMetadata extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      unknown,
      unknown,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  fragments: ReadonlyArray<string>;
  methods: Partial<
    Record<
      ep.HttpMethod,
      StaticAppEndpointBuilderSpec<
        TContext,
        TStateInfo,
        TStringDecoder,
        TStringEncoder,
        TOutputContents,
        TInputContents,
        TMetadata
      >
    >
  >;
  metadata: TMetadata;
  urlValidation: URLValidationInfo<TStringDecoder>;
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
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
  TMetadata extends Record<
    string,
    md.MetadataProviderForEndpoints<
      md.HKTArg,
      unknown,
      unknown,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> {
  builder: StaticAppEndpointBuilder<TContext, TStateInfo>;
  stateInfo: TStateInfo;
  requestHeadersSpec?: data.RequestHeaderDataValidatorSpecMetadata<
    string,
    TStringDecoder
  >;
  responseHeadersSpec?: data.ResponseHeaderDataValidatorSpecMetadata<
    string,
    TStringEncoder
  >;
  queryValidation?: data.QueryDataValidatorSpecMetadata<string, TStringDecoder>;
  inputValidation?: data.DataValidatorResponseInputValidatorSpec<TInputContents>;
  outputValidation: data.DataValidatorResponseOutputValidatorSpec<TOutputContents>;
  mdArgs: {
    [P in keyof TMetadata]: TMetadata[P] extends md.MetadataProviderForEndpoints<
      infer TArg,
      infer _0, // eslint-disable-line @typescript-eslint/no-unused-vars
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

export type StaticAppEndpointBuilder<TContext, TStateInfo> = (
  groupNamePrefix: string,
  // groups: Record<string, string>,
) => ep.StaticAppEndpointHandler<TContext, TStateInfo>;
