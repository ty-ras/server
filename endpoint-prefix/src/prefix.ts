import * as ep from "@ty-ras/endpoint";
import * as prefixedEndpoint from "./endpoint";

/**
 * Create one single `AppEndpoint` which serves given other `AppEndpoint`s behind given URL prefix.
 * @param urlPrefix The URL prefix to use.
 * @param endpoints The endpoints to prefix.
 * @returns Single `AppEndpoint` which serves given `AppEndpoint`s behind URL prefix.
 * @example If one `AppEndpoint` was given to serve from `"/endpoint"` URL, and the `urlPrefix` parameter to this function was `"/prefix"`, then the returned `AppEndpoint` will serve the given endpoint at URL `"/prefix/endpoint"`.
 */
export function atPrefix<TContext, TStateInfo>(
  urlPrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo>;

/**
 * Create one single `AppEndpoint` which serves given other `AppEndpoint`s behind given URL prefix.
 * The group name prefix for the final regexp used to match request URLs against is customized.
 *
 * Notice that group name prefix will be only used when the returned `AppEndpoint` will be used as parameter to another call to this function.
 * @param urlPrefix The URL prefix to use.
 * @param regexpGroupNamePrefix The prefix for RegExp group name to be used when constructing final RegExp to match request URLs.
 * @param endpoints The endpoints to prefix.
 * @returns Single `AppEndpoint` which serves given `AppEndpoint`s behind URL prefix.
 * @example If one `AppEndpoint` was given to serve from `"/endpoint"` URL, and the `urlPrefix` parameter to this function was `"/prefix"`, then the returned `AppEndpoint` will serve the given endpoint at URL `"/prefix/endpoint"`.
 */
export function atPrefix<TContext, TStateInfo>(
  urlPrefix: string,
  regexpGroupNamePrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo>;

export function atPrefix<TContext, TStateInfo>(
  urlPrefix: string,
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
  const regexpGroupNamePrefix =
    typeof endpointOrGroupNamePrefix === "string"
      ? endpointOrGroupNamePrefix
      : // Default: remove forward slashes, and replace dashes with underscores
        urlPrefix.replaceAll(/[/-]/g, (matched) =>
          matched === "/" ? "" : "_",
        );
  const topLevelEndpoints = allEndpoints
    .map((endpoint, idx) => ({ endpoint, idx }))
    .filter(({ endpoint }) => tryGetPrefix(endpoint) === "");
  if (topLevelEndpoints.length > 0) {
    if (urlPrefix === "" && allEndpoints.length === 1) {
      // Top-level prefix against one top-level prefixed endpoint = same endpoint
      return allEndpoints[0];
    } else {
      throw new InvalidEndpointsError(topLevelEndpoints.map(({ idx }) => idx));
    }
  }
  return new prefixedEndpoint.PrefixedEndpoint(
    urlPrefix,
    regexpGroupNamePrefix,
    allEndpoints,
  );
}

export const tryGetPrefix = <TContext, TStateInfo>(
  endpoint: ep.AppEndpoint<TContext, TStateInfo>,
) =>
  endpoint instanceof prefixedEndpoint.PrefixedEndpoint
    ? endpoint.urlPrefix
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
