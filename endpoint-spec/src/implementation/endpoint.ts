/**
 * @file This internal file contains code related to creating one {@link ep.AppEndpoint} from given inputs.
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import * as ep from "@ty-ras/endpoint";
import type * as api from "../api.types";

/* eslint-disable @typescript-eslint/ban-types */

/**
 * This function will create {@link ep.AppEndpoint} from given URL information and per-HTTP-method additional specifications.
 * @param root0 The {@link URLParameterValidatorsAndMD}.
 * @param root0.urlValidators Privately deconstructed variable.
 * @param root0.urlMD Privately deconstructed variable.
 * @param urlPathPattern The {@link md.URLPathPatternInfo}.
 * @param specs The per-HTTP-method {@link InternalStateForEndpointMethodRuntime}s.
 * @returns The {@link ep.AppEndpoint} behaving as specified by inputs.
 */
export default <
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TServerContext,
>(
  { urlValidators, urlMD }: URLParameterValidatorsAndMD<TValidatorHKT>,
  urlPathPattern: md.URLPathPatternInfo,
  specs: Record<
    protocol.HttpMethod,
    InternalStateForEndpointMethodRuntime<TStateHKT>
  >,
): ep.AppEndpoint<
  TServerContext,
  dataBE.MaterializeStateInfo<
    TStateHKT,
    dataBE.MaterializeStateSpecBase<TStateHKT>
  >
> => ({
  getRegExpAndHandler: (groupNamePrefix) => ({
    url: urlValidators
      ? buildURLRegExp(urlMD, urlPathPattern, groupNamePrefix)
      : new RegExp(ep.escapeRegExp(urlPathPattern.join(""))),
    handler: createAppEndpointHandlerGetter(
      urlValidators,
      specs,
      Object.fromEntries(
        urlPathPattern
          .filter(
            (maybeName): maybeName is md.URLParameterSpec =>
              typeof maybeName !== "string",
          )
          .map(({ name }) => [name, `${groupNamePrefix}${name}`]),
      ),
    ),
  }),
});

// For example, from URL string "/api/${id}" and the id parameter adhering to regexp X, build regexp:
// "/api/(?<ep_prefix_id>X)"
// Don't add start/end marks ^/$, since we want to allow prefixing URLs.
const buildURLRegExp = <TValidatorHKT extends data.ValidatorHKTBase>(
  urlMD: URLParameterValidatorsAndMD<TValidatorHKT>["urlMD"],
  urlPathPattern: md.URLPathPatternInfo,
  groupNamePrefix: string,
) => {
  return new RegExp(
    urlPathPattern.reduce<string>((currentRegExp, fragmentOrValidation) => {
      return `${currentRegExp}${
        typeof fragmentOrValidation === "string"
          ? ep.escapeRegExp(fragmentOrValidation)
          : `(?<${groupNamePrefix}${fragmentOrValidation.name}>${
              urlMD[fragmentOrValidation.name].regExp.source
            })`
      }`;
    }, ""),
  );
};

/**
 * This type contains all information related to single endpoint behind single URL path pattern and single HTTP method.
 */
export interface InternalStateForEndpointMethodRuntime<
  TStateHKT extends dataBE.StateHKTBase,
> {
  /**
   * The {@link ep.EndpointStateInformation} for the endpoint.
   */
  stateInfo: ep.EndpointStateInformation<
    dataBE.MaterializeStateInfo<
      TStateHKT,
      dataBE.MaterializeStateSpecBase<TStateHKT>
    >,
    dataBE.MaterializeRuntimeState<
      TStateHKT,
      dataBE.MaterializeStateSpecBase<TStateHKT>
    >
  >;

  /**
   * The handler, which is method with bound `this` parameter.
   */
  boundMethod: BoundMethod;

  /**
   * Information about other inputs for handler than URL, state, or handler itself.
   */
  handlerInfo: Omit<
    ep.AppEndpointHandler<never, never>,
    "stateInformation" | "urlValidator" | "handler"
  >;

  /**
   * Information about the response of the handler.
   */
  responseInfo: {
    body: dataBE.DataValidatorResponseOutput<unknown>;
    headers:
      | dataBE.ResponseHeaderDataValidators<protocol.TResponseHeadersDataBase>
      | undefined;
  };
}

/**
 * Helper type to represent a handler method with bound `this` parameter.
 */
export type BoundMethod = (this: void, arg: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

interface InternalStateForEndpointMethodRuntimeResponseInfo {
  body: dataBE.DataValidatorResponseOutput<unknown>;
  headers:
    | dataBE.ResponseHeaderDataValidators<protocol.TResponseHeadersDataBase>
    | undefined;
}

/**
 * This interface binds together the {@link dataBE.URLParameterValidators} and {@link dataBE.URLParameterValidatorSpecMetadata}.
 */
export interface URLParameterValidatorsAndMD<
  TValidatorHKT extends data.ValidatorHKTBase,
> {
  /**
   * The {@link dataBE.URLParameterValidators}.
   */
  urlValidators:
    | dataBE.URLParameterValidators<protocol.TURLDataBase>
    | undefined;

  /**
   * The {@link dataBE.URLParameterValidatorSpecMetadata}.
   */
  urlMD: dataBE.URLParameterValidatorSpecMetadata<
    protocol.TURLDataBase,
    TValidatorHKT
  >;
}

const createAppEndpointHandlerGetter =
  <TStateHKT extends dataBE.StateHKTBase, TServerContext>(
    urlValidators:
      | dataBE.URLParameterValidators<protocol.TURLDataBase>
      | undefined,
    specs: Record<
      protocol.HttpMethod,
      InternalStateForEndpointMethodRuntime<TStateHKT>
    >,
    groupNames: Record<string, string>,
  ): ep.AppEndpointHandlerGetter<
    TServerContext,
    dataBE.MaterializeStateInfo<
      TStateHKT,
      dataBE.MaterializeStateSpecBase<TStateHKT>
    >
  > =>
  // Notice that handler does not use the 2nd parameter containing RegExp match groups.
  // It is only used by prefixed endpoints in endpoint-prefix package.
  (method) => {
    const spec = specs[method];
    if (spec) {
      const { handlerInfo, stateInfo, boundMethod, responseInfo } = spec;
      return {
        found: "handler" as const,
        handler: {
          ...data.stripUndefineds({
            ...handlerInfo,
            stateInformation: stateInfo,
            urlValidator: urlValidators
              ? {
                  groupNames,
                  validators: urlValidators,
                }
              : undefined,
          }),
          handler: (args) =>
            getOutputFromMethodReturnValue(
              responseInfo,
              invokeBoundMethod(
                !!urlValidators,
                boundMethod,
                handlerInfo,
                responseInfo,
                args,
              ),
            ),
        },
      };
    } else {
      return {
        found: "invalid-method" as const,
        allowedMethods: Object.entries(specs).map(
          ([method, { stateInfo }]) => ({
            method: method as protocol.HttpMethod,
            stateInformation: stateInfo,
          }),
        ),
      };
    }
  };

const invokeBoundMethod = <TServerContext>(
  hasURL: boolean,
  boundMethod: Function,
  handlerInfo: InternalStateForEndpointMethodRuntime<never>["handlerInfo"],
  responseInfo: InternalStateForEndpointMethodRuntimeResponseInfo,
  {
    context,
    state,
    url,
    ...args
  }: ep.AppEndpointHandlerFunctionArgs<TServerContext>,
): api.MethodReturnTypeFull<{
  method: protocol.HttpMethod;
  responseBody: unknown;
  responseHeaders: protocol.TResponseHeadersDataBase;
}> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const methodResult = boundMethod(
    data.stripUndefineds({
      context,
      state,
      url: hasURL ? url : undefined,
      query: handlerInfo.queryValidator ? args.query : undefined,
      body: handlerInfo.bodyValidator ? args.body : undefined,
      headers: handlerInfo.headerValidator ? args.headers : undefined,
    }),
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return responseInfo.headers ? methodResult : { body: methodResult };
};

const getOutputFromMethodReturnValue = (
  responseInfo: InternalStateForEndpointMethodRuntimeResponseInfo,
  { body, headers }: ReturnType<typeof invokeBoundMethod>,
): ep.AppEndpointHandlerFunctionReturn => {
  const validatorResult = responseInfo.body(body);
  let outputResult:
    | dataBE.DataValidatorResponseOutputError
    | data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess>;
  if (validatorResult.error === "none") {
    if (responseInfo.headers) {
      if (!headers) {
        outputResult = data.exceptionAsValidationError(
          "Internal error: response headers returned when no headers expected.",
        );
      } else {
        const [proceed, validatedHeaders, errors] = dataBE.checkHeaders(
          responseInfo.headers,
          (hdrName) => headers[hdrName],
          false,
        );
        outputResult = proceed
          ? {
              error: "none",
              data: {
                ...validatorResult.data,
                headers: validatedHeaders,
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
