/**
 * @file This file contains utility code internal to this library.
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";

import type * as evt from "./events.types";

import * as stream from "node:stream";
import * as u from "node:url";
import * as util from "node:util";

/**
 * Helper function to check whether URL path matches RegExp, and invoke event, if it doesn't.
 * @param ctx The server context.
 * @param events The events callback.
 * @param url The URL.
 * @param regExp The RegExp to check URL path against.
 * @returns The matched RegExp groups, or nothing if no match.
 */
export const checkURLPathNameForHandler = <TContext>(
  ctx: TContext,
  events: evt.ServerEventHandler<TContext, never> | undefined,
  url: u.URL | string,
  regExp: RegExp,
): evt.EventArgumentsWithoutState<TContext> | undefined => {
  const pathName = (url instanceof u.URL ? url : new u.URL(url)).pathname;
  const groups = regExp.exec(pathName)?.groups;
  if (!groups) {
    events?.("onInvalidUrl", {
      ctx,
      regExp,
    });
  }
  return groups
    ? {
        ctx,
        groups,
        regExp,
      }
    : undefined;
};

/**
 * Handles bureaucracy involved in invoking event about invalid HTTP method.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param allowedMethodsInfo The information about allowed methods.
 * @param validateStateInfo The state validation information, if required.
 * @returns The information about allowed HTTP methods to be sent back to client.
 */
export const invokeInvalidMethodEvent = async <TContext, TStateInfo>(
  eventArgs: evt.EventArgumentsWithoutState<TContext>,
  events: evt.ServerEventHandler<TContext, never> | undefined,
  allowedMethodsInfo: Array<ep.EndpointMethodInformation<TStateInfo>>,
  validateStateInfo:
    | ((
        stateInfo: ep.EndpointStateInformation<TStateInfo, unknown>,
      ) => Promise<boolean>)
    | undefined,
) => {
  let allowedMethodsFiltered: Array<protocol.HttpMethod> | undefined;
  if (validateStateInfo) {
    // Group methods by state infos
    const methodsGroupedByStateInfos: Array<{
      stateInformation: ep.EndpointStateInformation<TStateInfo, unknown>;
      methods: Array<protocol.HttpMethod>;
    }> = [];
    allowedMethodsInfo.forEach(({ method, stateInformation }) => {
      const idx = methodsGroupedByStateInfos.findIndex((s) =>
        util.isDeepStrictEqual(
          s.stateInformation.stateInfo,
          stateInformation.stateInfo,
        ),
      );
      if (idx >= 0) {
        methodsGroupedByStateInfos[idx].methods.push(method);
      } else {
        methodsGroupedByStateInfos.push({
          stateInformation,
          methods: [method],
        });
      }
    });

    // Now validate state infos, and only include methods which pass validation (e.g. authorization header)
    allowedMethodsFiltered = (
      await Promise.all(
        methodsGroupedByStateInfos.map(async (info) =>
          (await validateStateInfo(info.stateInformation)) ? info.methods : [],
        ),
      )
    ).flat();
  }

  const allowedMethods = allowedMethodsInfo.map(({ method }) => method);
  // Create copy of array to prevent accidental modifications
  const allowedMethodsSentToClient =
    allowedMethodsFiltered === undefined
      ? allowedMethods
      : [...allowedMethodsFiltered];
  events?.("onInvalidMethod", {
    ...eventArgs,
    allowedMethods,
    allowedMethodsSentToClient,
  });

  return allowedMethodsSentToClient;
};

/**
 * Handles bureaucracy involved in validating the state and invoking the events as needed.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param validator The state validator.
 * @param state The state.
 * @returns Information about either success or failure.
 */
export const checkStateForHandler = <TContext, TState>(
  eventArgs: evt.EventArgumentsWithoutState<TContext>,
  events: evt.ServerEventHandler<TContext, TState> | undefined,
  validator: dataBE.StateValidator<TState>,
  state: unknown,
) => {
  const validationResult = validator(state);
  let validatedContextOrError:
    | {
        result: "state";
        state: TState;
      }
    | {
        result: "error";
        customStatusCode: number | undefined;
        customBody: string | undefined;
      };
  if (validationResult.error === "none") {
    validatedContextOrError = {
      result: "state",
      state: validationResult.data,
    };
  } else {
    const isProtocolError = validationResult.error === "protocol-error";
    events?.("onInvalidState", {
      ...eventArgs,
      validationError: validationResult,
    });
    validatedContextOrError = {
      result: "error",
      customStatusCode: isProtocolError
        ? validationResult.statusCode
        : undefined,
      customBody: isProtocolError ? validationResult.body : undefined,
    };
  }

  return validatedContextOrError;
};

/**
 * Handles bureaucracy involved with checking URL path parameters and invoking event as necessary.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param urlValidation The URL path parameter validator.
 * @returns Whether to proceed to check further inputs, and possible URL paths.
 */
export const checkURLParametersForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events: evt.ServerEventHandler<TContext, TState> | undefined,
  urlValidation: ep.AppEndpointHandler<TContext, never>["urlValidator"],
  // This is not really that complex...
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  let url: protocol.TURLDataBase | undefined;
  let proceedToInvokeHandler = true;
  if (urlValidation) {
    url = {};
    const errors: Record<string, Array<data.DataValidatorResultError>> = {};
    for (const [parameterName, validator] of Object.entries(
      urlValidation.validators,
    )) {
      const groupName = urlValidation.groupNames[parameterName];
      const groupValue = eventArgs.groups[groupName];
      const thisErrors: Array<data.DataValidatorResultError> = [];
      if (groupValue === undefined) {
        thisErrors.push(
          data.exceptionAsValidationError(
            `No regexp match for group "${groupName}".`,
          ),
        );
      } else {
        const validatorResult = validator(groupValue);
        if (validatorResult.error === "none") {
          url[parameterName] = validatorResult.data;
        } else {
          thisErrors.push(validatorResult);
        }
      }
      if (thisErrors.length > 0) {
        proceedToInvokeHandler = false;
        errors[parameterName] = thisErrors;
      }
    }
    if (!proceedToInvokeHandler) {
      events?.("onInvalidUrlParameters", {
        ...eventArgs,
        validationError: errors,
      });
    }
  }
  return [proceedToInvokeHandler, url] as const;
};

/**
 * Handles bureaucracy involved with checking URL query parameters and invoking event as necessary.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param queryValidation The URL query parameter validator.
 * @param queryObject The parsed query object from URL.
 * @returns Whether to proceed to check further inputs, and possible URL query.
 */
export const checkQueryForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events: evt.ServerEventHandler<TContext, TState> | undefined,
  queryValidation: ep.AppEndpointHandler<TContext, never>["queryValidator"],
  queryObject: Record<string, data.QueryValue>,
) => {
  let query: protocol.TQueryDataBase = {};
  let proceedToInvokeHandler = true;
  if (queryValidation) {
    let errors: Record<string, data.DataValidatorResultError>;
    [proceedToInvokeHandler, query, errors] = dataBE.checkHeaders(
      queryValidation,
      (q) => queryObject[q],
      false,
    );
    if (!proceedToInvokeHandler) {
      events?.("onInvalidQuery", {
        ...eventArgs,
        validationError: errors,
      });
    }
  }
  return [proceedToInvokeHandler, query] as const;
};

/**
 * Handles bureaucracy involved with checking HTTP request headers and invoking event as necessary.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param headersValidation The HTTP request headers validator.
 * @param getHeaderValue The callback to extract header value given header name.
 * @returns Whether to proceed to check further inputs, and possible HTTP headers.
 */
export const checkHeadersForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events: evt.ServerEventHandler<TContext, TState> | undefined,
  headersValidation:
    | dataBE.RequestHeaderDataValidators<Record<string, unknown>>
    | undefined,
  getHeaderValue: (
    headerName: string,
  ) => string | ReadonlyArray<string> | undefined,
) => {
  let headers: protocol.TRequestHeadersDataBase = {};
  let proceedToInvokeHandler = true;
  if (headersValidation) {
    let errors: Record<string, data.DataValidatorResultError>;
    [proceedToInvokeHandler, headers, errors] = dataBE.checkHeaders(
      headersValidation,
      getHeaderValue,
      true,
    );
    if (!proceedToInvokeHandler) {
      events?.("onInvalidRequestHeaders", {
        ...eventArgs,
        validationError: errors,
      });
    }
  }

  return [proceedToInvokeHandler, headers] as const;
};

/**
 * Handles bureaucracy involved with checking HTTP request body and invoking event as necessary.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param isBodyValid The HTTP request body validator.
 * @param contentType The content type of the request body.
 * @param bodyStream The {@link stream.Readable} to read body from.
 * @returns Whether to proceed to check further inputs, and possible HTTP headers.
 */
export const checkBodyForHandler = async <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events: evt.ServerEventHandler<TContext, TState> | undefined,
  isBodyValid: ep.AppEndpointHandler<TContext, never>["bodyValidator"],
  contentType: string,
  bodyStream: stream.Readable | undefined,
) => {
  let body: unknown;
  let proceedToInvokeHandler: boolean;
  if (isBodyValid) {
    const bodyValidationResult = await isBodyValid({
      contentType: contentType,
      input: bodyStream ?? stream.Readable.from([]),
    });
    if (bodyValidationResult.error === "none") {
      body = bodyValidationResult.data;
      proceedToInvokeHandler = true;
    } else {
      proceedToInvokeHandler = false;
      if (bodyValidationResult.error === "error") {
        events?.("onInvalidBody", {
          ...eventArgs,
          validationError: bodyValidationResult,
        });
      } else {
        events?.("onInvalidContentType", {
          ...eventArgs,
          contentType,
        });
      }
    }
  } else {
    proceedToInvokeHandler =
      bodyStream === undefined || bodyStream.readableLength === 0;
  }

  return [proceedToInvokeHandler, body] as const;
};

/**
 * Handles the bureaucracy involved in invoking actual endpoint handler, and invoking events if needed.
 * @param eventArgs The event arguments.
 * @param events The event callback.
 * @param handler The endpoint handler.
 * @param handlerParameters The endpoint handler parameters
 * @returns The return value of endpoint handler.
 */
export const invokeHandler = async <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events: evt.ServerEventHandler<TContext, TState> | undefined,
  handler: ep.AppEndpointHandler<TContext, never>["handler"],
  ...handlerParameters: Parameters<typeof handler>
) => {
  events?.("onSuccessfulInvocationStart", { ...eventArgs });
  const retVal = await handler(...handlerParameters);
  if (retVal.error === "none") {
    events?.("onSuccessfulInvocationEnd", { ...eventArgs });
  } else {
    events?.("onInvalidResponse", {
      ...eventArgs,
      validationError: retVal,
    });
  }
  return retVal;
};
