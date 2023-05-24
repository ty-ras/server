/**
 * @file This file contains code for "stage 2" builder. At this stage, it is possible to specify request body (if any), response body, and response header (if any) specifications.
 * It is also necessary to provide required data for metadata providers (e.g. OpenAPI/etc).
 *
 * This will result in "stage 3" builder, which further allows continuing creating new endpoints at same URL, or to finalize creation process.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars */

import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as ep from "@ty-ras/endpoint";
import type * as md from "@ty-ras/metadata";
import type * as common from "../common.types";
import type * as state from "./state.types";
import { AppEndpointBuilderStage3 } from ".";

/**
 * This class contains the endpoint builder at stage 2, which allows to:
 * - specify response body, and response header (if any) specifications, along with required data for metadata providers, to return {@link AppEndpointBuilderStage3}.
 *
 * Instances of this class should not be created by client code, instead utilizing `startBuildingAPI` function to acquire "stage 0" builder and proceed from there.
 */
export class AppEndpointBuilderStage2<
  TContext,
  TStateInfo,
  TState,
  TArgsURL extends object,
  TAllowedMethods extends data.HttpMethod,
  TArgsHeaders extends object,
  TArgsQuery extends object,
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
  /**
   * Creates new instance of this class.
   *
   * This constructor should not be called by client code, instead utilizing `startBuildingAPI` function to acquire "stage 0" builder and proceed from there.
   * @param _state The current state of endpoint builder.
   * @param _endpointStateValidator The endpoint state information.
   * @param _methods The allowed methods.
   * @param _queryInfo Query parameter specification.
   * @param _headerInfo Request header data specification.
   */
  public constructor(
    protected readonly _state: state.AppEndpointBuilderState<
      TContext,
      TStateInfo,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    >,
    protected readonly _endpointStateValidator: ep.EndpointStateInformation<
      TStateInfo,
      TState
    >,
    protected readonly _methods: Set<TAllowedMethods>,
    protected readonly _queryInfo: state.QueryInfo<TArgsQuery, TStringDecoder>,
    protected readonly _headerInfo: state.HeaderDataInfo<
      TArgsHeaders,
      TStringDecoder
    >,
  ) {}

  /**
   * Finalizes the current HTTP endpoint specification by providing callback to handle the request, along with response body and response headers specifications.
   * @param endpointHandler The callback for implementation of handling request, along with response headers specification.
   * @param outputSpec The response body specification.
   * @param mdArgs The required data for metadata providers.
   * @returns The {@link AppEndpointBuilderStage3}.
   */
  public withoutBody<TOutput, THeaderData extends dataBE.RuntimeAnyHeaders>(
    endpointHandler: common.EndpointHandlerSpec<
      TArgsURL & TArgsQuery & common.EndpointHandlerArgs<TContext, TState>,
      TOutput,
      THeaderData,
      TStringEncoder
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      TOutput,
      TOutputContents
    >,
    mdArgs: MetadataArgumentsWithHeaders<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      TOutput,
      keyof THeaderData
    >,
  ): AppEndpointBuilderStage3<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<data.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;

  /**
   * Finalizes the current HTTP endpoint specification by providing callback to handle the request, along with response body specification.
   * @param endpointHandler The callback for implementation of handling request.
   * @param outputSpec The response body specification.
   * @param mdArgs The required data for metadata providers.
   * @returns The {@link AppEndpointBuilderStage3}.
   */
  public withoutBody<TOutput>(
    endpointHandler: common.EndpointHandler<
      TArgsURL & TArgsQuery & common.EndpointHandlerArgs<TContext, TState>,
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
      TOutput
    >,
  ): AppEndpointBuilderStage3<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<data.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;

  /**
   * Finalizes the current HTTP endpoint specification by providing callback to handle the request, along with response body and possibly response headers specifications.
   * @param endpointHandlerSpec The callback for implementation of handling request, along with possibly response headers specification.
   * @param outputSpec The response body specification.
   * @param mdArgs The required data for metadata providers.
   * @returns The {@link AppEndpointBuilderStage3}.
   */
  public withoutBody<TOutput, THeaderData extends dataBE.RuntimeAnyHeaders>(
    endpointHandlerSpec:
      | common.EndpointHandler<
          TArgsURL & TArgsQuery & common.EndpointHandlerArgs<TContext, TState>,
          TOutput
        >
      | common.EndpointHandlerSpec<
          TArgsURL & TArgsQuery & common.EndpointHandlerArgs<TContext, TState>,
          TOutput,
          THeaderData,
          TStringEncoder
        >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      TOutput,
      TOutputContents
    >,
    mdArgs: MetadataArgumentsWithHeaders<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      TOutput,
      keyof THeaderData
    >,
  ): AppEndpointBuilderStage3<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<data.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      TStateInfo,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      ...createStaticEndpointSpec(
        this._endpointStateValidator,
        this._state.urlValidation,
        this._queryInfo,
        this._headerInfo,
        endpointHandlerSpec,
        outputSpec,
      ),
      mdArgs: mdArgs as any,
    };
    return new AppEndpointBuilderStage3({
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

/**
 * This class contains the endpoint builder at stage 2, which allows to:
 * - specify request body, response body, and response header (if any) specifications, along with required data for metadata providers, to return {@link AppEndpointBuilderStage3}.
 *
 * Instances of this class should not be created by client code, instead utilizing `startBuildingAPI` function to acquire "stage 0" builder and proceed from there.
 */
export class AppEndpointBuilderStage2WithBody<
  TContext,
  TStateInfo,
  TState,
  TArgsURL extends object,
  TAllowedMethods extends data.HttpMethod,
  TArgsHeaders extends object,
  TArgsQuery extends object,
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
> extends AppEndpointBuilderStage2<
  TContext,
  TStateInfo,
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
  /**
   * Finalizes the current HTTP endpoint specification by providing request body specification and callback to handle the request.
   * @param input The request body specification.
   * @param endpointHandler The callback for handling request.
   * @param outputSpec The response body specification.
   * @param mdArgs The required data for metadata providers.
   * @returns The {@link AppEndpointBuilderStage3}.
   */
  public withBody<THandlerResult, TBody>(
    input: dataBE.DataValidatorRequestInputSpec<TBody, TInputContents>,
    endpointHandler: common.EndpointHandler<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TContext, TState> &
        common.EndpointHandlerArgsWithBody<TBody>,
      THandlerResult
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: MetadataArgumentsWithBody<
      TArgsURL,
      TArgsHeaders,
      TArgsQuery,
      keyof TOutputContents,
      TMetadataProviders,
      THandlerResult,
      keyof TInputContents,
      TBody
    >,
  ): AppEndpointBuilderStage3<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<data.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;

  /**
   * Finalizes the current HTTP endpoint specification by providing request body specification, callback to handle the request, along with response body specifications.
   * @param input The request body specification.
   * @param endpointHandler The callback for implementation of handling request, along with response headers specification.
   * @param outputSpec The response body specification.
   * @param mdArgs The required data for metadata providers.
   * @returns The {@link AppEndpointBuilderStage3}.
   */
  public withBody<
    THandlerResult,
    TBody,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    input: dataBE.DataValidatorRequestInputSpec<TBody, TInputContents>,
    endpointHandlerSpec: common.EndpointHandlerSpec<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TContext, TState> &
        common.EndpointHandlerArgsWithBody<TBody>,
      THandlerResult,
      THeaderData,
      TStringEncoder
    >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: MetadataArgumentsWithBodyAndHeaders<
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
  ): AppEndpointBuilderStage3<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<data.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;

  /**
   * Finalizes the current HTTP endpoint specification by providing request body specification, callback to handle the request, along with possibly response body specifications.
   * @param inputSpec The request body specification.
   * @param endpointHandlerSpec The callback for implementation of handling request, along with possibly response headers specification.
   * @param outputSpec The response body specification.
   * @param mdArgs The required data for metadata providers.
   * @returns The {@link AppEndpointBuilderStage3}.
   */
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
            common.EndpointHandlerArgs<TContext, TState> &
            common.EndpointHandlerArgsWithBody<TBody>,
          THandlerResult
        >
      | common.EndpointHandlerSpec<
          TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TContext, TState> &
            common.EndpointHandlerArgsWithBody<TBody>,
          THandlerResult,
          THeaderData,
          TStringEncoder
        >,
    outputSpec: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: MetadataArgumentsWithBodyAndHeaders<
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
  ): AppEndpointBuilderStage3<
    TContext,
    TStateInfo,
    TArgsURL,
    Exclude<data.HttpMethod, TAllowedMethods>,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      TStateInfo,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      ...createStaticEndpointSpec(
        this._endpointStateValidator,
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
    return new AppEndpointBuilderStage3({
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
  TStateInfo,
  TState,
  TStringDecoder,
  TStringEncoder,
  THeaderData extends dataBE.RuntimeAnyHeaders,
  TArgsURL extends object,
  TArgsQuery extends object,
  TArgsHeaders extends object,
  TEndpointArgs extends TArgsURL &
    TArgsQuery &
    common.EndpointHandlerArgs<TContext, TState>,
  THandlerResult,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
>(
  stateInformation: ep.EndpointStateInformation<TStateInfo, TState>,
  urlValidation: state.URLValidationInfo<TStringDecoder>,
  queryInfo: state.QueryInfo<TArgsQuery, TStringDecoder>,
  headerInfo: state.HeaderDataInfo<TArgsHeaders, TStringDecoder>,
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
    !!urlValidation,
    endpointHandler,
    outputValidator,
    responseHeaders?.validators,
    ({ query, headers, body }) => ({
      ...getQueryEndpointArgs(query),
      ...getHeaderEndpointArgs(headers),
      ...(inputSpec ? { body } : {}),
    }),
  );
  const retVal: Omit<
    state.StaticAppEndpointBuilderSpec<
      TContext,
      TStateInfo,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      never
    >,
    "mdArgs"
  > = {
    stateInformation,
    outputValidation: outputSpec,
    builder: (groupNamePrefix) =>
      stripUndefineds({
        stateInformation,
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
    TArgs,
    THandlerResult,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    setURL: boolean,
    endpointHandler: common.EndpointHandler<
      TArgs,
      { body: THandlerResult; headers?: THeaderData }
    >,
    validator: dataBE.DataValidatorResponseOutput<THandlerResult>,
    responseHeadersValidators:
      | dataBE.ResponseHeaderDataValidators<THeaderData>
      | undefined,
    getAdditionalArgs: (
      args: Omit<
        Parameters<ep.AppEndpointHandlerFunction<TContext>>[0],
        "context" | "state" | "url"
      >,
    ) => object,
  ): ep.AppEndpointHandlerFunction<TContext> =>
  async ({ context, state, url, ...args }) => {
    const handlerArgs = {
      ...getAdditionalArgs(args),
      context,
      state,
    };
    if (setURL) {
      (
        handlerArgs as unknown as common.EndpointHandlerArgsWithURL<unknown>
      ).url = url;
    }
    const { body, headers: responseHeaders } = await endpointHandler(
      handlerArgs as unknown as Parameters<typeof endpointHandler>[0],
    );
    const validatorResult = validator(body);
    let outputResult:
      | dataBE.DataValidatorResponseOutputError
      | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
    if (validatorResult.error === "none") {
      if (responseHeadersValidators) {
        if (!responseHeaders) {
          outputResult = data.exceptionAsValidationError(
            "Internal error: response headers returned when no headers expected.",
          );
        } else {
          const [proceed, validatedHeaders, errors] = dataBE.checkHeaders(
            responseHeadersValidators,
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

/**
 * The required data for metadata providers, when there is no request body nor response header specifications.
 */
export type MetadataArguments<
  TArgsURL extends object,
  TArgsHeaders extends object,
  TArgsQuery extends object,
  TOutputContentsKeys extends PropertyKey,
  TMetadataProviders,
  THandlerResult,
> = {
  [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
    infer TArg,
    infer _,
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
        undefined,
        undefined,
        { [P in TOutputContentsKeys]: THandlerResult }
      >
    : never;
};

/**
 * The required data for metadata providers, when there is response headers specification, but no request body specification.
 */
export type MetadataArgumentsWithHeaders<
  TArgsURL extends object,
  TArgsHeaders extends object,
  TArgsQuery extends object,
  TOutputContentsKeys extends PropertyKey,
  TMetadataProviders,
  THandlerResult,
  TResponseHeaderKeys extends PropertyKey,
> = {
  [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
    infer TArg,
    infer _,
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
        { [P in TResponseHeaderKeys]: unknown },
        undefined,
        { [P in TOutputContentsKeys]: THandlerResult }
      >
    : never;
};

/**
 * The required data for metadata providers, when there is request body specification, but no response headers specification.
 */
export type MetadataArgumentsWithBody<
  TArgsURL extends object,
  TArgsHeaders extends object,
  TArgsQuery extends object,
  TOutputContentsKeys extends PropertyKey,
  TMetadataProviders,
  THandlerResult,
  TInputContentsKeys extends PropertyKey,
  TBody,
> = {
  [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
    infer TArg,
    infer _,
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
        undefined,
        { [P in TInputContentsKeys]: TBody },
        { [P in TOutputContentsKeys]: THandlerResult }
      >
    : never;
};

/**
 * The required data for metadata providers, when there are both request body and response headers specifications.
 */
export type MetadataArgumentsWithBodyAndHeaders<
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
  [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
    infer TArg,
    infer _,
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
        { [P in TResponseHeaderKeys]: unknown },
        { [P in TInputContentsKeys]: TBody },
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
