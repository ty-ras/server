import type * as data from "@ty-ras/data-backend";

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
  THeaderEncoder,
> = {
  handler: EndpointHandler<
    TArgs,
    EndpointHandlerOutputWithHeaders<THandlerResult, THeaderData>
  >;
  headers: data.ResponseHeaderDataValidatorSpec<THeaderData, THeaderEncoder>;
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
  THeaderEncoder,
>(
  handler: EndpointHandler<
    TArgs,
    EndpointHandlerOutputWithHeaders<THandlerResult, THeaderData>
  >,
  headers: data.ResponseHeaderDataValidatorSpec<THeaderData, THeaderEncoder>,
): EndpointHandlerSpec<TArgs, THandlerResult, THeaderData, THeaderEncoder> => ({
  handler,
  headers,
});
