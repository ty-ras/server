import type * as ep from "@ty-ras/endpoint";
import type * as url from "url";

export type StateProvider<TContext, TStateInfo> = (args: {
  context: TContext;
  url: url.URL;
  stateInfo: TStateInfo;
}) => ep.MaybePromise<unknown>;
