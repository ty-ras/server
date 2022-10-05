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
  TArgsURL,
  TAllowedMethods extends ep.HttpMethod,
  TArgsHeaders,
  TArgsQuery,
  THeaderDecoder,
  THeaderEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends Record<
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
  public constructor(
    protected readonly _state: state.AppEndpointBuilderState<
      TContext,
      TRefinedContext,
      TState,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    >,
    protected readonly _methods: Set<TAllowedMethods>,
    protected readonly _queryInfo: common.QueryInfo<TArgsQuery, THeaderDecoder>,
    protected readonly _headerInfo: common.HeaderDataInfo<
      TArgsHeaders,
      THeaderDecoder
    >,
  ) {}

  public withoutBody<TOutput, THeaderData extends dataBE.RuntimeAnyHeaders>(
    endpointHandler: common.EndpointHandlerSpec<
      TArgsURL &
        TArgsQuery &
        common.EndpointHandlerArgs<TRefinedContext, TState>,
      TOutput,
      THeaderData,
      THeaderEncoder
    >,
    {
      validator,
      ...outputSpec
    }: dataBE.DataValidatorResponseOutputSpec<TOutput, TOutputContents>,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
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
            { [P in keyof THeaderData]: unknown },
            undefined,
            { [P in keyof TOutputContents]: TOutput }
          >
        : never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    THeaderDecoder,
    THeaderEncoder,
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
    {
      validator,
      ...outputSpec
    }: dataBE.DataValidatorResponseOutputSpec<TOutput, TOutputContents>,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
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
            { [P in keyof TOutputContents]: TOutput }
          >
        : never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    THeaderDecoder,
    THeaderEncoder,
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
          THeaderEncoder
        >,
    {
      validator,
      ...outputSpec
    }: dataBE.DataValidatorResponseOutputSpec<TOutput, TOutputContents>,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
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
            { [P in keyof THeaderData]: unknown } | undefined,
            undefined,
            { [P in keyof TOutputContents]: TOutput }
          >
        : never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const isFunction = typeof endpointHandlerSpec === "function";
    const endpointHandler = isFunction
      ? async (
          args: TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState>,
        ) => ({ body: await endpointHandlerSpec(args) })
      : endpointHandlerSpec.handler;
    const responseHeaders = isFunction
      ? undefined
      : endpointHandlerSpec.headers;
    const { query, getEndpointArgs: getQueryEndpointArgs } = this._queryInfo;
    const { headers, getEndpointArgs: getHeaderEndpointArgs } =
      this._headerInfo;
    const { contextTransform, urlValidation } = this._state;
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      outputValidation: outputSpec,
      builder: (groupNamePrefix) => {
        const retVal: ep.StaticAppEndpointHandler<TContext> = {
          // TODO use runtime pick props for contextValidator!
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
          queryValidator: query?.validators,
          headerValidator: headers?.validators,
          handler: async ({ context, state, url, headers, query }) => {
            const handlerArgs = {
              ...getQueryEndpointArgs(query),
              ...getHeaderEndpointArgs(headers),
              context,
              state,
            };
            if (urlValidation) {
              (
                handlerArgs as unknown as common.EndpointHandlerArgsWithURL<unknown>
              ).url = url;
            }
            const handlerResult = await endpointHandler(
              handlerArgs as unknown as Parameters<typeof endpointHandler>[0],
            );
            const validatorResult = validator(handlerResult.body);
            let outputResult:
              | data.DataValidatorResultError
              | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
            if (validatorResult.error === "none") {
              if (responseHeaders) {
                if (!("headers" in handlerResult)) {
                  outputResult = data.exceptionAsValidationError(
                    "Internal error: response headers returned when no headers expected.",
                  );
                } else {
                  const [proceed, validatedHeaders, errors] =
                    dataBE.checkHeaders(
                      responseHeaders.validators,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                      (hdrName) => handlerResult.headers[hdrName] as any,
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
          },
        };

        return retVal;
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      mdArgs: mdArgs as any,
    };
    if (headers) {
      handler.requestHeadersSpec = headers.metadata;
    }
    if (responseHeaders) {
      handler.responseHeadersSpec = responseHeaders.metadata;
    }
    if (query) {
      handler.queryValidation = query.metadata;
    }
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

  private _getStage1State<
    TOutput,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
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
          THeaderEncoder
        >,
    {
      validator,
      ...outputSpec
    }: dataBE.DataValidatorResponseOutputSpec<TOutput, TOutputContents>,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
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
            { [P in keyof THeaderData]: unknown } | undefined,
            undefined,
            { [P in keyof TOutputContents]: TOutput }
          >
        : never;
    },
  ): state.AppEndpointBuilderState<
    TContext,
    TRefinedContext,
    TState,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const isFunction = typeof endpointHandlerSpec === "function";
    const endpointHandler = isFunction
      ? async (
          args: TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState>,
        ) => ({ body: await endpointHandlerSpec(args) })
      : endpointHandlerSpec.handler;
    const responseHeaders = isFunction
      ? undefined
      : endpointHandlerSpec.headers;
    const { query, getEndpointArgs: getQueryEndpointArgs } = this._queryInfo;
    const { headers, getEndpointArgs: getHeaderEndpointArgs } =
      this._headerInfo;
    const { contextTransform, urlValidation } = this._state;
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      outputValidation: outputSpec,
      builder: (groupNamePrefix) => {
        const retVal: ep.StaticAppEndpointHandler<TContext> = {
          // TODO use runtime pick props for contextValidator!
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
          queryValidator: query?.validators,
          headerValidator: headers?.validators,
          handler: async ({ context, state, url, headers, query }) => {
            const handlerArgs = {
              ...getQueryEndpointArgs(query),
              ...getHeaderEndpointArgs(headers),
              context,
              state,
            };
            if (urlValidation) {
              (
                handlerArgs as unknown as common.EndpointHandlerArgsWithURL<unknown>
              ).url = url;
            }
            const handlerResult = await endpointHandler(
              handlerArgs as unknown as Parameters<typeof endpointHandler>[0],
            );
            const validatorResult = validator(handlerResult.body);
            let outputResult:
              | data.DataValidatorResultError
              | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
            if (validatorResult.error === "none") {
              if (responseHeaders) {
                if (!("headers" in handlerResult)) {
                  outputResult = data.exceptionAsValidationError(
                    "Internal error: response headers returned when no headers expected.",
                  );
                } else {
                  const [proceed, validatedHeaders, errors] =
                    dataBE.checkHeaders(
                      responseHeaders.validators,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                      (hdrName) => handlerResult.headers[hdrName] as any,
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
          },
        };

        return retVal;
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      mdArgs: mdArgs as any,
    };
    if (headers) {
      handler.requestHeadersSpec = headers.metadata;
    }
    if (responseHeaders) {
      handler.responseHeadersSpec = responseHeaders.metadata;
    }
    if (query) {
      handler.queryValidation = query.metadata;
    }
    return {
      ...this._state,
      methods: Object.assign(
        {},
        Object.fromEntries(
          Array.from(this._methods.values()).map((method) => [method, handler]),
        ),
        this._state.methods,
      ),
    };
  }
}

export class AppEndpointBuilderForMethodsAndBody<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL,
  TAllowedMethods extends ep.HttpMethod,
  TArgsHeaders,
  TArgsQuery,
  THeaderDecoder,
  THeaderEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends Record<
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
> extends AppEndpointBuilderForMethods<
  TContext,
  TRefinedContext,
  TState,
  TArgsURL,
  TAllowedMethods,
  TArgsHeaders,
  TArgsQuery,
  THeaderDecoder,
  THeaderEncoder,
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
    output: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
        infer _0,
        infer _1,
        infer _2,
        infer _3
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
            { [P in keyof TInputContents]: TBody },
            { [P in keyof TOutputContents]: THandlerResult }
          >
        : never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    THeaderDecoder,
    THeaderEncoder,
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
      THeaderEncoder
    >,
    output: dataBE.DataValidatorResponseOutputSpec<
      THandlerResult,
      TOutputContents
    >,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
        infer _0,
        infer _1,
        infer _2,
        infer _3
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
            { [P in keyof THeaderData]: unknown },
            { [P in keyof TInputContents]: TBody },
            { [P in keyof TOutputContents]: THandlerResult }
          >
        : never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  >;
  public withBody<
    THandlerResult,
    TBody,
    THeaderData extends dataBE.RuntimeAnyHeaders,
  >(
    {
      validator: inputValidator,
      ...inputSpec
    }: dataBE.DataValidatorRequestInputSpec<TBody, TInputContents>,
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
          THeaderEncoder
        >,
    {
      validator: outputValidator,
      ...outputSpec
    }: dataBE.DataValidatorResponseOutputSpec<THandlerResult, TOutputContents>,
    mdArgs: {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataBuilder<
        infer TArg,
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        unknown,
        infer _0,
        infer _1,
        infer _2,
        infer _3
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
            { [P in keyof THeaderData]: unknown } | undefined,
            { [P in keyof TInputContents]: TBody },
            { [P in keyof TOutputContents]: THandlerResult }
          >
        : never;
    },
  ): AppEndpointBuilder<
    TContext,
    TRefinedContext,
    TState,
    TArgsURL,
    Exclude<ep.HttpMethod, TAllowedMethods>,
    THeaderDecoder,
    THeaderEncoder,
    TOutputContents,
    TInputContents,
    TMetadataProviders
  > {
    const isFunction = typeof endpointHandlerSpec === "function";
    const endpointHandler = isFunction
      ? async (
          args: TArgsURL &
            TArgsQuery &
            common.EndpointHandlerArgs<TRefinedContext, TState> &
            common.EndpointHandlerArgsWithBody<TBody>,
        ) => ({ body: await endpointHandlerSpec(args) })
      : endpointHandlerSpec.handler;
    const responseHeaders = isFunction
      ? undefined
      : endpointHandlerSpec.headers;
    const { query, getEndpointArgs: getQueryEndpointArgs } = this._queryInfo;
    const { headers, getEndpointArgs: getHeaderEndpointArgs } =
      this._headerInfo;
    const { contextTransform, urlValidation } = this._state;
    const handler: state.StaticAppEndpointBuilderSpec<
      TContext,
      THeaderDecoder,
      THeaderEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    > = {
      inputValidation: inputSpec,
      outputValidation: outputSpec,
      builder: (groupNamePrefix) => {
        const retVal: ep.StaticAppEndpointHandler<TContext> = {
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
          headerValidator: headers?.validators,
          queryValidator: query?.validators,
          bodyValidator: inputValidator,
          handler: async ({ context, state, url, headers, body, query }) => {
            const handlerArgs = {
              ...getQueryEndpointArgs(query),
              ...getHeaderEndpointArgs(headers),
              context,
              state,
              body: body as TBody,
            };
            if (urlValidation) {
              (
                handlerArgs as unknown as common.EndpointHandlerArgsWithURL<unknown>
              ).url = url;
            }
            const handlerResult = await endpointHandler(
              handlerArgs as unknown as Parameters<typeof endpointHandler>[0],
            );
            const validatorResult = outputValidator(handlerResult.body);
            let outputResult:
              | data.DataValidatorResultError
              | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
            if (validatorResult.error === "none") {
              if (responseHeaders) {
                if (!("headers" in handlerResult)) {
                  outputResult = data.exceptionAsValidationError(
                    "Internal error: response headers returned when no headers expected.",
                  );
                } else {
                  const [proceed, validatedHeaders, errors] =
                    dataBE.checkHeaders(
                      responseHeaders.validators,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                      (hdrName) => handlerResult.headers[hdrName] as any,
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
          },
        };
        return retVal;
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      mdArgs: mdArgs as any,
    };
    if (headers) {
      handler.requestHeadersSpec = headers.metadata;
    }
    if (responseHeaders) {
      handler.responseHeadersSpec = responseHeaders.metadata;
    }
    if (query) {
      handler.queryValidation = query.metadata;
    }
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

const createStaticAppEndpointHandlerFunction =
  <TContext, TRefinedContext, TState, TStringDecoder, TArgs, THandlerResult>(
    contextTransform: dataBE.ContextValidatorSpec<
      TContext,
      TRefinedContext,
      TState
    >,
    urlValidation: state.URLValidationInfo<TStringDecoder>,
    endpointHandler: common.EndpointHandler<TArgs, THandlerResult>,
  ): ep.StaticAppEndpointHandlerFunction<TContext> =>
  async ({ context, state, url, headers, query }) => {
    const handlerArgs = {
      ...getQueryEndpointArgs(query),
      ...getHeaderEndpointArgs(headers),
      context,
      state,
    };
    if (urlValidation) {
      (
        handlerArgs as unknown as common.EndpointHandlerArgsWithURL<unknown>
      ).url = url;
    }
    const handlerResult = await endpointHandler(
      handlerArgs as unknown as Parameters<typeof endpointHandler>[0],
    );
    const validatorResult = validator(handlerResult.body);
    let outputResult:
      | data.DataValidatorResultError
      | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
    if (validatorResult.error === "none") {
      if (responseHeaders) {
        if (!("headers" in handlerResult)) {
          outputResult = data.exceptionAsValidationError(
            "Internal error: response headers returned when no headers expected.",
          );
        } else {
          const [proceed, validatedHeaders, errors] = dataBE.checkHeaders(
            responseHeaders.validators,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            (hdrName) => handlerResult.headers[hdrName] as any,
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
