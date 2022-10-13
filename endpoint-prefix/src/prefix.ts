import * as ep from "@ty-ras/endpoint";
import * as prefixedEndpoint from "./endpoint";

export function atPrefix<TContext, TMetadata extends Record<string, unknown>>(
  prefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TMetadata>>
): ep.AppEndpoint<TContext, TMetadata>;
export function atPrefix<TContext, TMetadata extends Record<string, unknown>>(
  prefix: string,
  regexpGroupNamePrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TMetadata>>
): ep.AppEndpoint<TContext, TMetadata>;
export function atPrefix<TContext, TMetadata extends Record<string, unknown>>(
  prefix: string,
  endpointOrGroupNamePrefix:
    | ep.AppEndpoint<TContext, TMetadata>
    | string
    | undefined,
  ...endpoints: Array<ep.AppEndpoint<TContext, TMetadata>>
): ep.AppEndpoint<TContext, TMetadata> {
  const allEndpoints =
    typeof endpointOrGroupNamePrefix === "string" || !endpointOrGroupNamePrefix
      ? endpoints
      : [endpointOrGroupNamePrefix, ...endpoints];
  const topLevelEndpoints = allEndpoints
    .map((endpoint, idx) => ({ endpoint, idx }))
    .filter(({ endpoint }) => tryGetPrefix(endpoint) === "");
  if (topLevelEndpoints.length > 0) {
    throw new InvalidEndpointsError(topLevelEndpoints.map(({ idx }) => idx));
  }
  return new prefixedEndpoint.PrefixedEndpoint(prefix, allEndpoints);
}

export const tryGetPrefix = <
  TContext,
  TMetadata extends Record<string, unknown>,
>(
  endpoint: ep.AppEndpoint<TContext, TMetadata>,
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
