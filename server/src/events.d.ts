import type * as data from "@ty-ras/data";

export type ServerEventEmitter<
  TContext,
  TState,
  TEvents extends keyof VirtualRequestProcessingEvents<
    TContext,
    TState
  > = keyof VirtualRequestProcessingEvents<TContext, TState>,
> = EventEmitter<
  Pick<VirtualRequestProcessingEvents<TContext, TState>, TEvents>
>;

export interface EventEmitter<TVirtualEvents extends object> {
  emit<TEventName extends keyof TVirtualEvents>(
    eventName: TEventName,
    eventArgs: TVirtualEvents[TEventName],
  ): void;
}

// This is 'virtual interface' -> instances of this interface are never meant to be created!
// It is only used for typing purposes
export interface VirtualRequestProcessingEvents<TContext, TState> {
  onSuccessfulInvocationStart: EventArguments<TContext, TState>;
  onSuccessfulInvocationEnd: EventArguments<TContext, TState>;

  // URL did not match combined regex
  onInvalidUrl: Omit<EventArguments<TContext, TState>, "groups">;
  // No handler for given HTTP method
  onInvalidMethod: EventArguments<TContext, TState>;
  // Context failed passing validation
  onInvalidContext: EventArguments<TContext, TState> &
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
}

export interface EventArguments<TContext, TState> {
  ctx: TContext;
  state: TState;
  groups: Record<string, string | undefined>;
  regExp: RegExp;
}

export interface ValidationErrorArgs<
  TValidationError = data.DataValidatorResultError,
> {
  validationError: TValidationError;
}
