import type * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as ep from "@ty-ras/endpoint";

export type MetadataProvidersBase<
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
> = Record<
  string,
  // We must use 'any' as some parameters, otherwise we won't be able to use AppEndpointBuilderProvider with specific TMetadataProviders type as parameter to functions.
  md.MetadataProvider<
    md.HKTArg,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    any,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    any,
    any,
    unknown
  >
>;

export interface EndpointHandlerArgs<TContext, TState> {
  context: TContext;
  state: TState;
}

export interface EndpointHandlerArgsWithURL<TDataInURL> {
  url: TDataInURL;
}

export interface EndpointHandlerArgsWithHeaders<THeaderData> {
  headers: THeaderData;
}

export interface EndpointHandlerArgsWithQuery<TQuery> {
  query: TQuery;
}

export interface EndpointHandlerArgsWithBody<TBody> {
  body: TBody;
}

export interface QueryInfo<TArgs, TDecoder> {
  query?: data.QueryValidatorSpec<data.RuntimeAnyQuery, TDecoder>;
  getEndpointArgs: (query: unknown) => TArgs;
}

export interface HeaderDataInfo<TArgs, THeaderValidators> {
  headers?: data.RequestHeaderDataValidatorSpec<
    Record<string, unknown>,
    THeaderValidators
  >;
  getEndpointArgs: (headers: data.RuntimeAnyHeaders) => TArgs;
}

export type EndpointHandlerSpec<
  TArgs,
  THandlerResult,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringEncoder,
> = {
  handler: EndpointHandler<
    TArgs,
    EndpointHandlerOutputWithHeaders<THandlerResult, THeaderData>
  >;
  headers: data.ResponseHeaderDataValidatorSpec<THeaderData, TStringEncoder>;
};

export type EndpointHandler<TArgs, THandlerResult> = (
  this: void,
  args: TArgs,
) => THandlerResult | Promise<THandlerResult>;

export interface EndpointHandlerOutputWithHeaders<
  TOutput,
  THeaderData extends data.RuntimeAnyHeaders,
> {
  body: TOutput;
  headers: THeaderData;
}

export interface AppEndpointWithMetadata<
  TContext,
  TStateInfo,
  TMetadata extends Record<string, unknown>,
> {
  endpoint: ep.AppEndpoint<TContext, TStateInfo>;
  getMetadata: (
    urlPrefix: string,
  ) => AppEndpointMetadataResult<TStateInfo, TMetadata>;
}

export interface AppEndpointMetadataResult<TStateInfo, TMetadata> {
  metadata: TMetadata;
  // Key: ep.HttpMethod
  stateInfo: Record<string, TStateInfo>;
}

export const handlerWithHeaders = <
  TArgs,
  THandlerResult,
  THeaderData extends data.RuntimeAnyHeaders,
  TStringEncoder,
>(
  handler: EndpointHandler<
    TArgs,
    EndpointHandlerOutputWithHeaders<THandlerResult, THeaderData>
  >,
  headers: data.ResponseHeaderDataValidatorSpec<THeaderData, TStringEncoder>,
): EndpointHandlerSpec<TArgs, THandlerResult, THeaderData, TStringEncoder> => ({
  handler,
  headers,
});
