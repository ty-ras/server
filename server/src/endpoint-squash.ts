/**
 * @file This file contains code for compacting multiple {@link ep.AppEndpoint}s into one.
 */

import type * as ep from "@ty-ras/endpoint";

/**
 * This is helper method to combine functionality of multiple {@link ep.AppEndpoint}s behind one single {@link ep.AppEndpoint}.
 *
 * It is achieved by creating one {@link RegExp} containing the {@link RegExp}s of given endpoints joined together with `|` operand.
 * All of the URL parameters of all the given endpoints will be uniquely named, and the name translation will be done by the returned {@link ep.AppEndpoint}.
 * @param endpoints The endpoints to delegate implementation to based on matched regexp.
 * @returns One single {@link ep.AppEndpoint} which will have its regexp as combination of regexps of all given {@link ep.AppEndpoint}s, and will delegate the implementation to the endpoint which matches the correct regexp.
 */
export default <TContext, TStateInfo>(
  endpoints: ReadonlyArray<ep.AppEndpoint<TContext, TStateInfo>>,
): ep.FinalizedAppEndpoint<TContext, TStateInfo> => {
  const { builtEndpoints, regExp } = buildEndpoints(endpoints);
  return {
    url: regExp,
    handler: createPrefixedHandlerImpl(builtEndpoints),
  };
};

const buildEndpoints = <TContext, TStateInfo>(
  endpoints: ReadonlyArray<ep.AppEndpoint<TContext, TStateInfo>>,
): PrefixedAppEndpointsInfo<TContext, TStateInfo> => {
  // TODO maybe throw if multiple endpoints have same regex?
  // Since currently, that is not supported.
  // The builder in endpoint-spec project already makes checks like that, so doing this here is not top prio.
  // In 99.99% of the cases, the endpoints we receive here, will be endpoint created and validated by endpoint-spec project.
  const builtEndpointInfo = endpoints.map(({ getRegExpAndHandler }, idx) => {
    const regExpGroupName = `e_${idx}`;
    return {
      regExpGroupName,
      builtEndpoint: getRegExpAndHandler(`${regExpGroupName}_`),
    };
  });

  const getNewRegExpSource: (source: string) => string = (source) =>
    `^${source}`;

  return {
    builtEndpoints: builtEndpointInfo.map(
      ({ regExpGroupName, builtEndpoint }) => ({
        regExpGroupName,
        handler: builtEndpoint.handler,
      }),
    ),
    regExp: new RegExp(
      builtEndpointInfo
        .map(
          ({ regExpGroupName, builtEndpoint: { url } }) =>
            // Notice that we don't know for certain whether our regexp should match from start to end.
            // However, we do know, that it must match to the end.
            // Otherwise, we will get false matches for parents paths.
            `(?<${regExpGroupName}>${getNewRegExpSource(url.source)}$)`,
        )
        .join("|"),
    ),
  };
};

function findFirstMatching<T, U>(
  iterable: Iterable<T>,
  tryMap: (item: T) => U | undefined,
) {
  for (const item of iterable) {
    const maybeValue = tryMap(item);
    if (maybeValue !== undefined) {
      return maybeValue;
    }
  }
  return undefined;
}

const createPrefixedHandlerImpl =
  <TContext, TStateInfo>(
    builtEndpoints: PrefixedAppEndpointsInfo<
      TContext,
      TStateInfo
    >["builtEndpoints"],
  ): ep.AppEndpointHandlerGetter<TContext, TStateInfo> =>
  (method, groups) => {
    const matchingHandler = findFirstMatching(
      builtEndpoints,
      ({ regExpGroupName, handler }) => {
        if (groups[regExpGroupName] !== undefined) {
          return handler(method, groups);
        }
      },
    );
    // Matching handler should really never be undefined at this point, but let's failsafe anyway
    return (
      matchingHandler ?? {
        found: "invalid-method",
        allowedMethods: [],
      }
    );
  };

interface PrefixedAppEndpointsInfo<TContext, TStateInfo> {
  builtEndpoints: {
    regExpGroupName: string;
    handler: ep.AppEndpointHandlerGetter<TContext, TStateInfo>;
  }[];
  regExp: RegExp;
}
