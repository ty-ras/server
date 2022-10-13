import type * as data from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as ep from "@ty-ras/endpoint";

export type StateProvider<TContext, TStateInfo> = (args: {
  context: TContext;
  stateInfo: TStateInfo;
}) => ep.MaybePromise<unknown>;

export type MetadataProvidersBase<
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
> = Record<
  string,
  // We must use 'any' as 2nd parameter, otherwise we won't be able to use AppEndpointBuilderProvider with specific TMetadataProviders type as parameter to functions.
  md.MetadataProvider<
    md.HKTArg,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    unknown,
    unknown,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    unknown,
    unknown
  >
>;

export type MetadataBuilderBase<
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends data.TOutputContentsBase,
  TInputContents extends data.TInputContentsBase,
> = Record<
  string,
  // We must use 'any' as 2nd parameter, otherwise we won't be able to use AppEndpointBuilderInitial with specific TMetadataProviders type as parameter to functions.
  md.MetadataBuilder<
    md.HKTArg,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    unknown,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents
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
