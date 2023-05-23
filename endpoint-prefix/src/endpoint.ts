/**
 * @file This file contains internal code related to modeling {@link ep.AppEndpoint} with a prefix.
 */

import * as ep from "@ty-ras/endpoint";

/**
 * This class implements serving multiple {@link ep.AppEndpoint}s behind given URL prefix.
 * Because of using class, it is also possible to distinguish 'normal' {@link ep.AppEndpoint}s and prefixed {@link ep.AppEndpoint}s.
 */
export class PrefixedEndpoint<TContext, TStateInfo>
  implements ep.AppEndpoint<TContext, TStateInfo>
{
  /**
   * Creates new instance of this class with given parameters.
   * @param urlPrefix The URL path prefix behind which the given {@link ep.AppEndpoint}s will be served.
   * @param regExpGroupNamePrefix The prefix to use for group names when constructing RegExp matching the URL path parameters of the {@link ep.AppEndpoint}s being served.
   * @param allEndpoints The {@link ep.AppEndpoint}s to serve behind the given URL path prefix.
   */
  public constructor(
    public readonly urlPrefix: string,
    private readonly regExpGroupNamePrefix: string,
    private readonly allEndpoints: ReadonlyArray<
      ep.AppEndpoint<TContext, TStateInfo>
    >,
  ) {
    // We have to use properties instead of instance method because the AppEndpoint interface specifies them like that.
    // If this is done via instance methods, then expression like "const { getMetadata, getRegExpAndHandler } = spec.atPrefix("prefix");"
    // will return functions which will fail as 'this' will be undefined
    this.getRegExpAndHandler = (groupNamePrefix) => {
      const { builtEndpoints, regExpSource } = buildEndpoints(
        this.allEndpoints,
        groupNamePrefix.length > 0
          ? // TODO this 'replaceAll' might need some ability to be customized at some point
            `${groupNamePrefix}${this.regExpGroupNamePrefix}_`
          : undefined,
      );
      return {
        url: new RegExp(`${ep.escapeRegExp(this.urlPrefix)}(${regExpSource})`),
        handler: createPrefixedHandlerImpl(builtEndpoints),
      };
    };
  }
  public getRegExpAndHandler: (
    groupNamePrefix: string,
  ) => ep.FinalizedAppEndpoint<TContext, TStateInfo>;
}

const buildEndpoints = <TContext, TStateInfo>(
  endpoints: ReadonlyArray<ep.AppEndpoint<TContext, TStateInfo>>,
  regExpGroupNamePrefix?: string,
): PrefixedAppEndpointsInfo<TContext, TStateInfo> => {
  const isTopLevel = !regExpGroupNamePrefix;
  const groupNamePrefix = isTopLevel ? "e_" : regExpGroupNamePrefix;
  // TODO maybe throw if multiple endpoints have same regex?
  // Since currently, that is not supported.
  // To properly detect this situation, instead of returning RegExp in buildURLRegExp in api/core/spec/stage3.ts,
  // One would need to return finalGroupName + regExpSource, which would also help in performance (unnecessary building of regexp objects).
  // In addition, all the HTTP methods would be needed to be returned as well.
  // Perhaps then also supporting multiple endpoints at same regex would become possible too.
  const builtEndpointInfo = endpoints.map(({ getRegExpAndHandler }, idx) => {
    const regExpGroupName = `${groupNamePrefix}${idx}`;
    return {
      regExpGroupName,
      builtEndpoint: getRegExpAndHandler(`${regExpGroupName}_`),
    };
  });

  const getNewRegExpSource: (source: string) => string = isTopLevel
    ? (source) => `^${source}`
    : (source) => source;

  return {
    builtEndpoints: builtEndpointInfo.map(
      ({ regExpGroupName, builtEndpoint }) => ({
        regExpGroupName,
        handler: builtEndpoint.handler,
      }),
    ),
    regExpSource: builtEndpointInfo
      .map(
        ({ regExpGroupName, builtEndpoint: { url } }) =>
          // Notice that we don't know for certain whether our regexp should match from start to end.
          // However, we do know, that it must match to the end.
          // Otherwise, we will get false matches for parents paths.
          `(?<${regExpGroupName}>${getNewRegExpSource(url.source)}$)`,
      )
      .join("|"),
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
  ): ep.DynamicHandlerGetter<TContext, TStateInfo> =>
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
    handler: ep.DynamicHandlerGetter<TContext, TStateInfo>;
  }[];
  regExpSource: string;
}
