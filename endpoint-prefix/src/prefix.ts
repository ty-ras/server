import * as ep from "@ty-ras/endpoint";
import * as prefixedEndpoint from "./endpoint";

export function atPrefix<TContext, TStateInfo>(
  prefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo>;
export function atPrefix<TContext, TStateInfo>(
  prefix: string,
  regexpGroupNamePrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo>;
export function atPrefix<TContext, TStateInfo>(
  prefix: string,
  endpointOrGroupNamePrefix:
    | ep.AppEndpoint<TContext, TStateInfo>
    | string
    | undefined,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo> {
  const allEndpoints =
    typeof endpointOrGroupNamePrefix === "string" || !endpointOrGroupNamePrefix
      ? endpoints
      : [endpointOrGroupNamePrefix, ...endpoints];
  const topLevelEndpoints = allEndpoints
    .map((endpoint, idx) => ({ endpoint, idx }))
    .filter(({ endpoint }) => tryGetPrefix(endpoint) === "");
  if (topLevelEndpoints.length > 0) {
    if (prefix === "" && allEndpoints.length === 1) {
      // Top-level prefix against one top-level prefixed endpoint = same endpoint
      return allEndpoints[0];
    } else {
      throw new InvalidEndpointsError(topLevelEndpoints.map(({ idx }) => idx));
    }
  }
  return new prefixedEndpoint.PrefixedEndpoint(prefix, allEndpoints);
}

export const tryGetPrefix = <TContext, TStateInfo>(
  endpoint: ep.AppEndpoint<TContext, TStateInfo>,
) =>
  endpoint instanceof prefixedEndpoint.PrefixedEndpoint
    ? endpoint.prefix
    : undefined;

export class InvalidEndpointsError extends Error {
  public constructor(public readonly endpointIndices: ReadonlyArray<number>) {
    super(
      `Endpoints at indices ${endpointIndices.join(
        ", ",
      )} were top-level endpoints and thus unprefixable.`,
    );
  }
}
