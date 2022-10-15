import type * as ep from "@ty-ras/endpoint";

export type StateProvider<TContext, TStateInfo> = (args: {
  context: TContext;
  stateInfo: TStateInfo;
}) => ep.MaybePromise<unknown>;
