import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";

import type * as evt from "./events";

import * as stream from "stream";
import * as u from "url";

export const checkURLPathNameForHandler = <TContext>(
  ctx: TContext,
  events: evt.ServerEventEmitter<TContext, never, "onInvalidUrl"> | undefined,
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

export const checkMethodForHandler = <TContext, TStateInfo>(
  eventArgs: evt.EventArgumentsWithoutState<TContext>,
  events:
    | evt.ServerEventEmitter<TContext, never, "onInvalidMethod">
    | undefined,
  method: ep.HttpMethod,
  handler: ep.DynamicHandlerGetter<TContext, TStateInfo>,
) => {
  const foundHandler = handler(method, eventArgs.groups);
  const foundSuccess = foundHandler.found === "handler";
  if (!foundSuccess) {
    events?.("onInvalidMethod", {
      ...eventArgs,
    });
  }
  return foundHandler;
};

export const checkStateForHandler = <TContext, TState>(
  eventArgs: evt.EventArgumentsWithoutState<TContext>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidContext">
    | undefined,
  validator: dataBE.StateValidator<unknown, TState>,
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
    events?.("onInvalidContext", {
      ...eventArgs,
      validationError: isProtocolError ? undefined : validationResult,
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

export const checkURLParametersForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidUrlParameters">
    | undefined,
  urlValidation: ep.StaticAppEndpointHandler<TContext, never>["urlValidator"],
  // This is not really that complex...
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  let url: Record<string, unknown> | undefined;
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

export const checkQueryForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidQuery">
    | undefined,
  queryValidation: ep.StaticAppEndpointHandler<
    TContext,
    never
  >["queryValidator"],
  queryObject: Record<string, data.QueryValue>,
) => {
  let query: dataBE.RuntimeAnyQuery = {};
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

export const checkHeadersForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidRequestHeaders">
    | undefined,
  headersValidation:
    | dataBE.RequestHeaderDataValidators<Record<string, unknown>>
    | undefined,
  getHeaderValue: (headerName: string) => string | Array<string> | undefined,
) => {
  let headers: dataBE.RuntimeAnyHeaders = {};
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

export const checkBodyForHandler = async <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<
        TContext,
        TState,
        "onInvalidBody" | "onInvalidContentType"
      >
    | undefined,
  isBodyValid: ep.StaticAppEndpointHandler<TContext, never>["bodyValidator"],
  contentType: string,
  bodyStream: stream.Readable | undefined,
) => {
  let body: unknown;
  let proceedToInvokeHandler: boolean;
  if (isBodyValid) {
    const bodyValidationResult = await isBodyValid({
      contentType: contentType,
      input: bodyStream ?? stream.Readable.from([]),
      // new stream.Readable({
      //   read() {
      //     setImmediate(() => {
      //       this.push(null);
      //       this.push(Buffer.alloc(0));
      //       this.push(null);
      //     });
      //   },
      // }),
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

export const invokeHandler = async <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<
        TContext,
        TState,
        | "onInvalidResponse"
        | "onSuccessfulInvocationStart"
        | "onSuccessfulInvocationEnd"
      >
    | undefined,
  handler: ep.StaticAppEndpointHandler<TContext, never>["handler"],
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
