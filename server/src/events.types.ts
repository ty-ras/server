/**
 * @file This types-only file contains type definitions related to various events that can occur when the server processes incoming HTTP request.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";

/**
 * This is callback type to handle the event related to server processing incoming HTTP request.
 */
export type ServerEventHandler<TContext, TState> = EventHandler<
  VirtualRequestProcessingEvents<TContext, TState>
>;

/**
 * This is generic callback type to handle event related to some processing.
 */
export type EventHandler<TVirtualEvents extends object, TReturn = void> = <
  TEventName extends keyof TVirtualEvents,
>(
  eventName: TEventName,
  eventArgs: TVirtualEvents[TEventName],
) => TReturn;

// This is 'virtual interface' -> instances of this interface are never meant to be created!
// It is only used for typing purposes
/**
 * This is *virtual* interface, which means that instances of this interface are never meant to be created.
 * Instead, this interface should be used as generic argument for {@link EventHandler} to *materialize* the final callback type.
 *
 * Each property of this interface specifies the string constant of the first argument for {@link EventHandler} callback.
 * The type of that property then is the type of the second argument for {@link EventHandler} callback.
 */
export interface VirtualRequestProcessingEvents<TContext, TState> {
  /**
   * This event occurs after all validation and deserialization for the HTTP request is done, and the actual processing of the request is about to start.
   */
  onSuccessfulInvocationStart: EventArguments<TContext, TState>;

  /**
   * This event occurs after `onSuccessfulInvocationStart` if the request processing did not throw any errors and return value was deemed to be valid.
   */
  onSuccessfulInvocationEnd: EventArguments<TContext, TState>;

  /**
   * This event occurs when incoming HTTP request contains URL which does not match any of the endpoint handlers registered for the server.
   */
  onInvalidUrl: Omit<EventArgumentsWithoutState<TContext>, "groups">;
  /**
   * This event occurs when incoming HTTP request contains URL which matches some endpoint handler, but that endpoint handler does not support the HTTP method of the request.
   */
  onInvalidMethod: EventArgumentsWithoutState<TContext> & {
    allowedMethods: ReadonlyArray<protocol.HttpMethod>;
    allowedMethodsSentToClient: ReadonlyArray<protocol.HttpMethod>;
  };
  /**
   * This event occurs when the state constructed by the callback given to server fails the validation of the state required by endpoint.
   */
  onInvalidState: EventArgumentsWithoutState<TContext> &
    ValidationErrorArgs<
      data.DataValidatorResultError | dataBE.HTTPProtocolError
    >;
  /**
   * This event occurs when incoming HTTP request contains URL which matches some endpoint handler, but the parameters extracted from the URL do not match the validation required by endpoint.
   */
  onInvalidUrlParameters: EventArguments<TContext, TState> &
    ValidationErrorArgs<Record<string, Array<data.DataValidatorResultError>>>;

  /**
   * This event occurs when incoming HTTP request contains headers which do not pass the validation required by endpoint.
   */
  onInvalidRequestHeaders: EventArguments<TContext, TState> &
    ValidationErrorArgs<Record<string, data.DataValidatorResultError>>;
  /**
   * This event occurs when incoming HTTP request URL query parameters do not pass the validation required by endpoint.
   */
  onInvalidQuery: EventArguments<TContext, TState> &
    ValidationErrorArgs<Record<string, data.DataValidatorResultError>>;
  /**
   * This event occurs when incoming HTTP request content type does not match the supported content types by the endpoint.
   */
  onInvalidContentType: EventArguments<TContext, TState> & {
    contentType: string;
  };
  /**
   * This event occurs when incoming HTTP request body do not pass validation required by endpoint.
   */
  onInvalidBody: EventArguments<TContext, TState> & ValidationErrorArgs;
  /**
   * This event occurs when the response body object returned by endpoint does not pass the validation required by endpoint itself.
   */
  onInvalidResponse: EventArguments<TContext, TState> &
    ValidationErrorArgs<
      data.DataValidatorResultError | dataBE.HTTPProtocolError
    >;
  /**
   * This event occurs whenever unexpected exception is thrown by e.g. some event handler, or endpoint.
   */
  onException: Pick<EventArguments<TContext, TState>, "ctx" | "regExp"> & {
    error: unknown;
  };
}

/**
 * This interface contains properties common for almost all events in {@link VirtualRequestProcessingEvents}.
 */
export interface EventArgumentsWithoutState<TContext> {
  /**
   * The server context.
   * Typically contains mutable functionality, so should be used with care.
   */
  ctx: TContext;
  /**
   * The RegExp groups of the URL path match.
   */
  groups: Record<string, string | undefined>;

  /**
   * The combined RegExp used to perform URL path match.
   */
  regExp: RegExp;
}

/**
 * This interface extends {@link EventArgumentsWithoutState} to also contain the state of the endpoint.
 */
export interface EventArguments<TContext, TState>
  extends EventArgumentsWithoutState<TContext> {
  /**
   * The state information of the endpoint.
   */
  state: TState;
}

/**
 * This interface contains information about validation error.
 */
export interface ValidationErrorArgs<
  TValidationError = data.DataValidatorResultError,
> {
  /**
   * The validation error that occurred.
   */
  validationError: TValidationError;
}
