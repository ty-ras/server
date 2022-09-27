import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";

import type * as evt from "./events";

import * as stream from "stream";
import * as u from "url";

export const checkURLPathNameForHandler = <TContext, TState>(
  ctx: TContext,
  state: TState,
  events: evt.ServerEventEmitter<TContext, TState, "onInvalidUrl"> | undefined,
  url: u.URL | string,
  regExp: RegExp,
) => {
  const pathName = (url instanceof u.URL ? url : new u.URL(url)).pathname;
  const groups = regExp.exec(pathName)?.groups;
  if (!groups) {
    events?.emit("onInvalidUrl", {
      ctx,
      state,
      regExp,
    });
  }
  return groups
    ? {
        ctx,
        state,
        groups,
        regExp,
      }
    : undefined;
};

export const checkMethodForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidMethod">
    | undefined,
  method: ep.HttpMethod,
  handler: ep.DynamicHandlerGetter<TContext>,
) => {
  const foundHandler = handler(method, eventArgs.groups);
  const foundSuccess = foundHandler.found === "handler";
  if (!foundSuccess) {
    events?.emit("onInvalidMethod", {
      ...eventArgs,
    });
  }
  return foundHandler;
};

export const checkContextForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidContext">
    | undefined,
  {
    validator,
    getState,
  }: ep.StaticAppEndpointHandler<TContext>["contextValidator"],
) => {
  const validationResult = validator(eventArgs.ctx);
  let validatedContextOrError:
    | {
        result: "context";
        context: unknown;
        state: ReturnType<typeof getState>;
      }
    | {
        result: "error";
        customStatusCode: number | undefined;
        customBody: string | undefined;
      };
  if (validationResult.error === "none") {
    validatedContextOrError = {
      result: "context",
      context: validationResult.data,
      state: getState(validationResult.data),
    };
  } else {
    const isProtocolError = validationResult.error === "protocol-error";
    events?.emit("onInvalidContext", {
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
  urlValidation: ep.StaticAppEndpointHandler<TContext>["urlValidator"],
) => {
  let url: Record<string, unknown> | undefined;
  let proceedToInvokeHandler: boolean;
  if (urlValidation) {
    url = {};
    const errors: Array<data.DataValidatorResultError> = [];
    for (const [parameterName, validator] of Object.entries(
      urlValidation.validators,
    )) {
      const groupName = urlValidation.groupNames[parameterName];
      const groupValue = eventArgs.groups[groupName];
      if (groupValue === undefined) {
        errors.push(
          data.exceptionAsValidationError(
            `No regexp match for group ${groupName}`,
          ),
        );
      } else {
        const validatorResult = validator(groupValue);
        switch (validatorResult.error) {
          case "none":
            url[parameterName] = validatorResult.data;
            break;
          default:
            errors.push(validatorResult);
            break;
        }
      }
    }
    proceedToInvokeHandler = errors.length === 0;
    if (!proceedToInvokeHandler) {
      events?.emit("onInvalidUrlParameters", {
        ...eventArgs,
        validationError: data.combineErrorObjects(errors),
      });
    }
  } else {
    proceedToInvokeHandler = true;
  }
  return [proceedToInvokeHandler, url] as const;
};

export const checkQueryForHandler = <TContext, TState>(
  eventArgs: evt.EventArguments<TContext, TState>,
  events:
    | evt.ServerEventEmitter<TContext, TState, "onInvalidQuery">
    | undefined,
  queryValidation: ep.StaticAppEndpointHandler<TContext>["queryValidator"],
  queryObject:
    | Record<string, string | Array<string> | undefined>
    | (() => data.DataValidatorResultError),
) => {
  let query: dataBE.RuntimeAnyQuery = {};
  let proceedToInvokeHandler = true;
  if (queryValidation) {
    let errors: Record<string, data.DataValidatorResultError>;
    if (typeof queryObject === "function") {
      errors = { [""]: queryObject() };
    } else {
      [proceedToInvokeHandler, query, errors] = dataBE.checkHeaders(
        queryValidation,
        (q) => queryObject[q],
        false,
      );
    }
    if (!proceedToInvokeHandler) {
      events?.emit("onInvalidQuery", {
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
      events?.emit("onInvalidRequestHeaders", {
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
  isBodyValid: ep.StaticAppEndpointHandler<TContext>["bodyValidator"],
  contentType: string,
  bodyStream: stream.Readable | undefined,
) => {
  let body: unknown;
  let proceedToInvokeHandler: boolean;
  if (isBodyValid) {
    const bodyValidationResult = await isBodyValid({
      contentType: contentType,
      input:
        bodyStream ??
        new stream.Readable({
          read() {
            setImmediate(() => {
              this.push(null);
              this.push(Buffer.alloc(0));
              this.push(null);
            });
          },
        }),
    });
    switch (bodyValidationResult.error) {
      case "none":
        body = bodyValidationResult.data;
        proceedToInvokeHandler = true;
        break;
      default:
        proceedToInvokeHandler = false;
        if (bodyValidationResult.error === "error") {
          events?.emit("onInvalidBody", {
            ...eventArgs,
            validationError: bodyValidationResult,
          });
        } else {
          events?.emit("onInvalidContentType", {
            ...eventArgs,
            contentType,
          });
        }
        break;
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
  handler: ep.StaticAppEndpointHandler<TContext>["handler"],
  ...handlerParameters: Parameters<typeof handler>
) => {
  events?.emit("onSuccessfulInvocationStart", { ...eventArgs });
  const retVal = await handler(...handlerParameters);
  if (retVal.error === "none") {
    events?.emit("onSuccessfulInvocationEnd", { ...eventArgs });
  } else {
    events?.emit("onInvalidResponse", {
      ...eventArgs,
      validationError: retVal,
    });
  }
  return retVal;
};
