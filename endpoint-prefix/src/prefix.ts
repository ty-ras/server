/**
 * @file This file contains the public API of this library to create single {@link ep.AppEndpoint} multiplexing multiple {@link ep.AppEndpoint}s behind a given URL path prefix.
 */

import * as ep from "@ty-ras/endpoint";
import * as prefixedEndpoint from "./endpoint";

/**
 * Create one single {@link ep.AppEndpoint} which serves given other {@link ep.AppEndpoint}s behind given URL prefix.
 * Notice that if URL prefix is empty string, the returned endpoint is considred to be "top-level" endpoint, and thus can not be prefixed anymore.
 *
 * If one {@link ep.AppEndpoint} was given to serve from `"/endpoint"` URL, and the `urlPrefix` parameter to this function was `"/prefix"`, then the returned {@link ep.AppEndpoint} will serve the given endpoint at URL `"/prefix/endpoint"`.
 * @param urlPrefix The URL prefix to use.
 * @param endpoints The endpoints to prefix.
 * @returns Single {@link ep.AppEndpoint} which serves given {@link ep.AppEndpoint}s behind URL prefix.
 * @throws InvalidEndpointsError If there are more than one endpoint and given `urlPrefix` is not empty string, and the endpoints are considered to be "top-level", meaning that they were already constructed by this function with empty string as URL prefix.
 */
export function atPrefix<TContext, TStateInfo>(
  urlPrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo>;

/**
 * Create one single {@link ep.AppEndpoint} which serves given other {@link ep.AppEndpoint}s behind given URL prefix.
 * The group name prefix for the final regexp used to match request URLs against is customized.
 *
 * Notice that if URL prefix is empty string, the returned endpoint is considred to be "top-level" endpoint, and thus can not be prefixed anymore.
 *
 * Notice that group name prefix will be only used when the returned {@link ep.AppEndpoint} will be used as parameter to another call to this function.
 *
 * If one {@link ep.AppEndpoint} was given to serve from `"/endpoint"` URL, and the `urlPrefix` parameter to this function was `"/prefix"`, then the returned {@link ep.AppEndpoint} will serve the given endpoint at URL `"/prefix/endpoint"`.
 * @param urlPrefix The URL prefix to use.
 * @param regexpGroupNamePrefix The prefix for RegExp group name to be used when constructing final RegExp to match request URLs.
 * @param endpoints The endpoints to prefix.
 * @returns Single {@link ep.AppEndpoint} which serves given {@link ep.AppEndpoint}s behind URL prefix.
 * @throws InvalidEndpointsError If there are more than one endpoint and given `urlPrefix` is not empty string, and the endpoints are considered to be "top-level", meaning that they were already constructed by this function with empty string as URL prefix.
 */
export function atPrefix<TContext, TStateInfo>(
  urlPrefix: string,
  regexpGroupNamePrefix: string,
  ...endpoints: Array<ep.AppEndpoint<TContext, TStateInfo>>
): ep.AppEndpoint<TContext, TStateInfo>;

/**
 * Create one single {@link ep.AppEndpoint} which serves given other {@link ep.AppEndpoint}s behind given URL prefix.
 * If provided, the group name prefix for the final regexp will be used to match request URLs against is customized.
 *
 * Notice that if URL prefix is empty string, the returned endpoint is considred to be "top-level" endpoint, and thus can not be prefixed anymore.
 * @param urlPrefix The URL prefix to use.
 * @param endpointOrGroupNamePrefix The single endpoint, or the prefix for RegExp group name to be used when constructing final RegExp to match request URLs.
 * @param endpoints The {@link ep.AppEndpoint}s to prefix.
 * @returns Single {@link ep.AppEndpoint} which serves given {@link ep.AppEndpoint}s behind URL prefix.
 * @throws InvalidEndpointsError If there are more than one endpoint and given `urlPrefix` is not empty string, and the endpoints are considered to be "top-level", meaning that they were already constructed by this function with empty string as URL prefix.
 */
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

/**
 * Tries to extract the prefix for given {@link ep.AppEndpoint}, if it was constructed via {@link atPrefix}.
 * @param endpoint The {@link ep.AppEndpoint} to attempt extract prefix from.
 * @returns Either the URL prefix as `string`, if the given `endpoint` was constructed via {@link atPrefix}, or `undefined` if the given `endpoint` was not identified to be constructed via {@link atPrefix}.
 */
export const tryGetPrefix = <TContext, TStateInfo>(
  endpoint: ep.AppEndpoint<TContext, TStateInfo>,
) =>
  endpoint instanceof prefixedEndpoint.PrefixedEndpoint
    ? endpoint.urlPrefix
    : undefined;

/**
 * This is the error thrown by {@link atPrefix} when there are more than one {@link ep.AppEndpoint} given with empty string as URL prefix, and the endpoints were already created with {@link atPrefix} with empty URL prefix.
 */
export class InvalidEndpointsError extends Error {
  /**
   * Creates new instance of this class with given parameters.
   * @param endpointIndices The indices of given endpoints which were top-level.
   */
  public constructor(public readonly endpointIndices: ReadonlyArray<number>) {
    super(
      `Endpoints at indices ${endpointIndices.join(
        ", ",
      )} were top-level endpoints and thus unprefixable.`,
    );
  }
}
