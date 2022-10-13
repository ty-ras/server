import * as ep from "@ty-ras/endpoint";
import * as prefixedEndpoint from "./endpoint";

export function atPrefix<
  TContext,
  TStateInfo,
  TMetadata extends ep.TMetadataBase,
>(
  prefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo, TMetadata>>
): ep.AppEndpoint<TContext, TStateInfo, TMetadata>;
export function atPrefix<
  TContext,
  TStateInfo,
  TMetadata extends ep.TMetadataBase,
>(
  prefix: string,
  regexpGroupNamePrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo, TMetadata>>
): ep.AppEndpoint<TContext, TStateInfo, TMetadata>;
export function atPrefix<
  TContext,
  TStateInfo,
  TMetadata extends ep.TMetadataBase,
>(
  prefix: string,
  endpointOrGroupNamePrefix:
    | ep.AppEndpoint<TContext, TStateInfo, TMetadata>
    | string
    | undefined,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo, TMetadata>>
): ep.AppEndpoint<TContext, TStateInfo, TMetadata> {
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
  TStateInfo,
  TMetadata extends ep.TMetadataBase,
>(
  endpoint: ep.AppEndpoint<TContext, TStateInfo, TMetadata>,
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
