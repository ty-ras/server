/**
 * @file This types-only file contains types to be used by concrete server implementations.
 */
import type * as ep from "@ty-ras/endpoint";

/**
 * This is generic callback that can be used by concrete HTTP server implementations for types which construct the state (something that is not done by the server implementations themselves).
 */
export type StateProvider<TContext, TStateInfo> = (args: {
  context: TContext;
  stateInfo: TStateInfo;
}) => ep.MaybePromise<unknown>;
