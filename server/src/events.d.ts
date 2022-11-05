import type * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";

export type ServerEventHandler<TContext, TState> = EventHandler<
  VirtualRequestProcessingEvents<TContext, TState>
>;

export type EventHandler<TVirtualEvents extends object, TReturn = void> = <
  TEventName extends keyof TVirtualEvents,
>(
  eventName: TEventName,
  eventArgs: TVirtualEvents[TEventName],
) => TReturn;

// This is 'virtual interface' -> instances of this interface are never meant to be created!
// It is only used for typing purposes
export interface VirtualRequestProcessingEvents<TContext, TState> {
  onSuccessfulInvocationStart: EventArguments<TContext, TState>;
  onSuccessfulInvocationEnd: EventArguments<TContext, TState>;

  // URL did not match combined regex
  onInvalidUrl: Omit<EventArgumentsWithoutState<TContext>, "groups">;
  // No handler for given HTTP method
  onInvalidMethod: EventArgumentsWithoutState<TContext> & {
    allowedMethods: ReadonlyArray<ep.HttpMethod>;
    allowedMethodsSentToClient: ReadonlyArray<ep.HttpMethod>;
  };
  // State required by endpoint failed passing validation
  onInvalidState: EventArgumentsWithoutState<TContext> &
    ValidationErrorArgs<data.DataValidatorResultError | undefined>;
  // URL matched combined regex, but parameter validation failed
  onInvalidUrlParameters: EventArguments<TContext, TState> &
    ValidationErrorArgs<Record<string, Array<data.DataValidatorResultError>>>;
  onInvalidRequestHeaders: EventArguments<TContext, TState> &
    ValidationErrorArgs<Record<string, data.DataValidatorResultError>>;
  // Could not parse query string
  onInvalidQuery: EventArguments<TContext, TState> &
    ValidationErrorArgs<Record<string, data.DataValidatorResultError>>;
  // No validator for body content type
  onInvalidContentType: EventArguments<TContext, TState> & {
    contentType: string;
  };
  // Request body did not pass data validation
  onInvalidBody: EventArguments<TContext, TState> & ValidationErrorArgs;
  // Response body did not pass data validation
  onInvalidResponse: EventArguments<TContext, TState> & ValidationErrorArgs;
  // There was an exception thrown
  onException: Pick<EventArguments<TContext, TState>, "ctx" | "regExp"> & {
    error: unknown;
  };
}

export interface EventArgumentsWithoutState<TContext> {
  ctx: TContext;
  groups: Record<string, string | undefined>;
  regExp: RegExp;
}

export type EventArguments<TContext, TState> =
  EventArgumentsWithoutState<TContext> & {
    state: TState;
  };

export interface ValidationErrorArgs<
  TValidationError = data.DataValidatorResultError,
> {
  validationError: TValidationError;
}
