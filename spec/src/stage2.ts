import * as ep from "@ty-ras/endpoint";
import * as dataBE from "@ty-ras/data-backend";
import * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";
import type * as common from "./common";
import type * as state from "./state";
import { AppEndpointBuilder } from ".";

export class AppEndpointBuilderForMethods<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL extends object,
  TAllowedMethods extends ep.HttpMethod,
  TArgsHeaders extends object,
  TArgsQuery extends object,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends Record<
    string,
    md.MetadataBuilder<
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
  public constructor(
    protected readonly _state: state.AppEndpointBuilderState<
      TContext,
      TRefinedContext,
      TState,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    >,
    protected readonly _methods: Set<TAllowedMethods>,
    protected readonly _queryInfo: common.QueryInfo<TArgsQuery, TStringDecoder>,
    protected readonly _headerInfo: common.HeaderDataInfo<
      TArgsHeaders,
      TStringDecoder
    >,
  ) {}

  public withoutBody<TOutput, THeaderData extends dataBE.RuntimeAnyHeaders>(
    endpointHandler: common.EndpointHandlerSpec<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TRefinedContext, TState>,
      TOutput,
      THeaderData,
      TStringEncoder
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      TOutput,
      TOutputContents
    >,
    mdArgs: MetadataArguments<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      TOutput,
      keyof THeaderData,
      never,
      never
    >,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public withoutBody<TOutput>(
    endpointHandler: common.EndpointHandler<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TRefinedContext, TState>,
      TOutput
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      TOutput,
      TOutputContents
    >,
    mdArgs: MetadataArguments<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      TOutput,
      never,
      never,
      never
    >,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public withoutBody<TOutput, THeaderData extends dataBE.RuntimeAnyHeaders>(
    endpointHandlerSpec:
      | common.EndpointHandler<
          TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState>,
          TOutput
        >
      | common.EndpointHandlerSpec<
          TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState>,
          TOutput,
          THeaderData,
          TStringEncoder
        >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      TOutput,
      TOutputContents
    >,
    mdArgs: MetadataArguments<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      TOutput,
      keyof THeaderData,
      never,
      never
    >,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      ...createStaticEndpointSpec(
        this._state.contextTransform,
        this._state.urlValidation,
        this._queryInfo,
        this._headerInfo,
        endpointHandlerSpec,
        outputSpec,
      ),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mdArgs: mdArgs as any,
    };
    return new AppEndpointBuilder({
      ...this._state,
      methods: Object.assign(
        {},
        Object.fromEntries(
          Array.from(this._methods.values()).map((method) => [method, handler]),
        ),
        this._state.methods,
      ),
    });
  }
}

export class AppEndpointBuilderForMethodsAndBody<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL extends object,
  TAllowedMethods extends ep.HttpMethod,
  TArgsHeaders extends object,
  TArgsQuery extends object,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends Record<
    string,
    md.MetadataBuilder<
      md.HKTArg,
      unknown,
      unknown,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents
    >
  >,
> extends AppEndpointBuilderForMethods<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL,
  TAllowedMethods,
  TArgsHeaders,
  TArgsQuery,
  TStringDecoder,
  TStringEncoder,
  TOutputContents,
  TInputContents,
  TMetadataProviders
> {
  public withBody<THandlerResult, TBody>(
    input: dataBE.DataValidatorRequestInputSpec<TBody, TInputContents>,
    endpointHandler: common.EndpointHandler<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TRefinedContext, TState> &
        common.EndpointHandlerArgsWithBody<TBody>,
      THandlerResult
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: MetadataArguments<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      THandlerResult,
      never,
      keyof TInputContents,
      TBody
    >,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public withBody<
    THandlerResult,
    TBody,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    input: dataBE.DataValidatorRequestInputSpec<TBody, TInputContents>,
    endpointHandlerSpec: common.EndpointHandlerSpec<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TRefinedContext, TState> &
        common.EndpointHandlerArgsWithBody<TBody>,
      THandlerResult,
      THeaderData,
      TStringEncoder
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: MetadataArguments<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      THandlerResult,
      keyof THeaderData,
      keyof TInputContents,
      TBody
    >,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public withBody<
    THandlerResult,
    TBody,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    inputSpec: dataBE.DataValidatorRequestInputSpec<TBody, TInputContents>,
    endpointHandlerSpec:
      | common.EndpointHandler<
          TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState> &
            common.EndpointHandlerArgsWithBody<TBody>,
          THandlerResult
        >
      | common.EndpointHandlerSpec<
          TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState> &
            common.EndpointHandlerArgsWithBody<TBody>,
          THandlerResult,
          THeaderData,
          TStringEncoder
        >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: MetadataArguments<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      THandlerResult,
      keyof THeaderData,
      keyof TInputContents,
      TBody
    >,
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      ...createStaticEndpointSpec(
        this._state.contextTransform,
        this._state.urlValidation,
        this._queryInfo,
        this._headerInfo,
        endpointHandlerSpec,
        outputSpec,
        inputSpec,
      ),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mdArgs: mdArgs as any,
    };
    return new AppEndpointBuilder({
      ...this._state,
      methods: Object.assign(
        {},
        Object.fromEntries(
          Array.from(this._methods.values()).map((method) => [method, handler]),
        ),
        this._state.methods,
      ),
    });
  }
}

const createStaticEndpointSpec = <
  TContext,
  TRefinedContext,
  TState,
  TStringDecoder,
  TStringEncoder,
  THeaderData extends dataBE.RuntimeAnyHeaders,
  TArgsURL extends object,
  TArgsQuery extends object,
  TArgsHeaders extends object,
  TEndpointArgs extends TArgsURL &
    TArgsQuery &
    common.EndpointHandlerArgs<TRefinedContext, TState>,
  THandlerResult,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
>(
  contextTransform: dataBE.ContextValidatorSpec<
    TContext,
    TRefinedContext,
    TState
  >,
  urlValidation: state.URLValidationInfo<TStringDecoder>,
  queryInfo: common.QueryInfo<TArgsQuery, TStringDecoder>,
  headerInfo: common.HeaderDataInfo<TArgsHeaders, TStringDecoder>,
  endpointHandlerSpec:
    | common.EndpointHandler<TEndpointArgs, THandlerResult>
    | common.EndpointHandlerSpec<
        TEndpointArgs,
        THandlerResult,
        THeaderData,
        TStringEncoder
      >,
  {
    validator: outputValidator,
    validatorSpec: outputSpec,
  }: dataBE.DataValidatorResponseOutputSpec<THandlerResult, TOutputContents>,
  inputSpec?: dataBE.DataValidatorRequestInputSpec<unknown, TInputContents>,
) => {
  const isFunction = typeof endpointHandlerSpec === "function";
  const endpointHandler = isFunction
    ? async (args: TEndpointArgs) => ({ body: await endpointHandlerSpec(args) })
    : endpointHandlerSpec.handler;
  const responseHeaders = isFunction ? undefined : endpointHandlerSpec.headers;
  const { query, getEndpointArgs: getQueryEndpointArgs } = queryInfo;
  const { headers, getEndpointArgs: getHeaderEndpointArgs } = headerInfo;
  const handler = createStaticAppEndpointHandlerFunction(
    urlValidation,
    endpointHandler,
    outputValidator,
    responseHeaders,
    ({ query, headers, body }) => ({
      ...getQueryEndpointArgs(query),
      ...getHeaderEndpointArgs(headers),
      ...(inputSpec ? { body } : {}),
    }),
  );
  const retVal: Omit<
    state.StaticAppEndpointBuilderSpec<
      TContext,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      never
    >,
    "mdArgs"
  > = {
    outputValidation: outputSpec,
    builder: (groupNamePrefix) =>
      stripUndefineds({
        contextValidator:
          contextTransform as ep.StaticAppEndpointHandler<TContext>["contextValidator"],
        urlValidator: urlValidation
          ? {
              groupNames: Object.fromEntries(
                urlValidation.args.map((parameterName) => [
                  parameterName,
                  `${groupNamePrefix}${parameterName}`,
                ]),
              ),
              validators: urlValidation.validation.validators,
            }
          : undefined,
        handler,
        headerValidator: headers?.validators,
        queryValidator: query?.validators,
        bodyValidator: inputSpec?.validator,
      }),
  };
  if (headers) {
    retVal.requestHeadersSpec = headers.metadata;
  }
  if (responseHeaders) {
    retVal.responseHeadersSpec = responseHeaders.metadata;
  }
  if (query) {
    retVal.queryValidation = query.metadata;
  }
  if (inputSpec) {
    retVal.inputValidation = inputSpec?.validatorSpec;
  }

  return retVal;
};

const createStaticAppEndpointHandlerFunction =
  <
    TContext,
    TStringDecoder,
    TStringEncoder,
    TArgs,
    THandlerResult,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    urlValidation: state.URLValidationInfo<TStringDecoder>,
    endpointHandler: common.EndpointHandler<
      TArgs,
      { body: THandlerResult; headers?: THeaderData }
    >,
    validator: dataBE.DataValidatorResponseOutput<THandlerResult>,
    responseHeadersSpec:
      | dataBE.ResponseHeaderDataValidatorSpec<THeaderData, TStringEncoder>
      | undefined,
    getAdditionalArgs: (
      args: Omit<
        Parameters<ep.StaticAppEndpointHandlerFunction<TContext>>[0],
        "context" | "state" | "url"
      >,
    ) => object,
  ): ep.StaticAppEndpointHandlerFunction<TContext> =>
  async ({ context, state, url, ...args }) => {
    const handlerArgs = {
      ...getAdditionalArgs(args),
      context,
      state,
    };
    if (urlValidation) {
      (
        handlerArgs as unknown as common.EndpointHandlerArgsWithURL<unknown>
      ).url = url;
    }
    const { body, headers: responseHeaders } = await endpointHandler(
      handlerArgs as unknown as Parameters<typeof endpointHandler>[0],
    );
    const validatorResult = validator(body);
    let outputResult:
      | data.DataValidatorResultError
      | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
    if (validatorResult.error === "none") {
      if (responseHeadersSpec) {
        if (!responseHeaders) {
          outputResult = data.exceptionAsValidationError(
            "Internal error: response headers returned when no headers expected.",
          );
        } else {
          const [proceed, validatedHeaders, errors] = dataBE.checkHeaders(
            responseHeadersSpec.validators,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            (hdrName) => responseHeaders[hdrName] as any,
            false,
          );
          outputResult = proceed
            ? {
                error: "none",
                data: {
                  ...validatorResult.data,
                  headers: validatedHeaders as Exclude<
                    dataBE.DataValidatorResponseOutputSuccess["headers"],
                    undefined
                  >,
                },
              }
            : data.combineErrorObjects(Object.values(errors));
        }
      } else {
        outputResult = {
          error: "none",
          data: validatorResult.data,
        };
      }
    } else {
      outputResult = validatorResult;
    }
    return outputResult;
  };

export type MetadataArguments<
  TArgsURL extends object,
  TArgsHeaders extends object,
  TArgsQuery extends object,
  TOutputContentsKeys extends PropertyKey,
  TMetadataProviders,
  THandlerResult,
  TResponseHeaderKeys extends PropertyKey,
  TInputContentsKeys extends PropertyKey,
  TBody,
> = {
  [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
    infer TArg,
    infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
    infer _0,
    infer _1,
    infer _2,
    infer _3,
    infer _4
  >
    ? md.Kind<
        TArg,
        TArgsURL extends common.EndpointHandlerArgsWithURL<unknown>
          ? { [P in keyof TArgsURL["url"]]: unknown }
          : undefined,
        TArgsQuery extends common.EndpointHandlerArgsWithQuery<unknown>
          ? { [P in keyof TArgsQuery["query"]]: unknown }
          : undefined,
        TArgsHeaders extends common.EndpointHandlerArgsWithHeaders<unknown>
          ? { [P in keyof TArgsHeaders["headers"]]: unknown }
          : undefined,
        never extends TResponseHeaderKeys
          ? undefined
          : { [P in TResponseHeaderKeys]: unknown },
        never extends TInputContentsKeys
          ? undefined
          : { [P in TInputContentsKeys]: TBody },
        { [P in TOutputContentsKeys]: THandlerResult }
      >
    : never;
};

// TODO this is duplicate from metadata-openapi
// Move to @ty-ras/data
const stripUndefineds = <T extends Record<string, unknown>>(val: T): T => {
  for (const key of Object.keys(val)) {
    if (val[key] === undefined) {
      delete val[key];
    }
  }
  return val;
};
