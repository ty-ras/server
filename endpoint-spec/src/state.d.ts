import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";

export interface AppEndpointBuilderState<
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
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
      data.HttpMethod,
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
      validation: dataBE.URLParameterValidatorSpec<
        dataBE.RuntimeAnyURLData,
        TStringDecoder
      >;
    }
  | undefined;

export interface StaticAppEndpointBuilderSpec<
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
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
  stateValidator: ep.EndpointStateValidator<TStateInfo, unknown>;
  requestHeadersSpec?: dataBE.RequestHeaderDataValidatorSpecMetadata<
    string,
    TStringDecoder
  >;
  responseHeadersSpec?: dataBE.ResponseHeaderDataValidatorSpecMetadata<
    string,
    TStringEncoder
  >;
  queryValidation?: dataBE.QueryDataValidatorSpecMetadata<
    string,
    TStringDecoder
  >;
  inputValidation?: dataBE.DataValidatorResponseInputValidatorSpec<TInputContents>;
  outputValidation: dataBE.DataValidatorResponseOutputValidatorSpec<TOutputContents>;
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
