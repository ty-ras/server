import * as ep from "@ty-ras/endpoint";
import * as data from "@ty-ras/data";

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
  return {
    getRegExpAndHandler: (groupNamePrefix) => {
      const { builtEndpoints, regExpSource } = buildEndpoints(
        allEndpoints,
        groupNamePrefix.length > 0
          ? // TODO this 'replaceAll' might need some ability to be customized at some point
            `${groupNamePrefix}${prefix.replaceAll("/", "")}_`
          : undefined,
      );
      return {
        url: new RegExp(`${ep.escapeRegExp(prefix)}(${regExpSource})`),
        handler: createPrefixedHandlerImpl(builtEndpoints),
      };
    },
    getMetadata: (urlPrefix) => {
      return (
        allEndpoints.reduce((curResult, { getMetadata }) => {
          const mdDic = getMetadata(`${urlPrefix}${prefix}`);
          if (curResult === undefined) {
            curResult = data.transformEntries(mdDic, () => []);
          }
          for (const key of Object.keys(mdDic)) {
            curResult[key].push(...mdDic[key]);
          }
          return curResult;
        }, undefined as undefined | { [P in keyof TMetadata]: Array<TMetadata[P]> }) ??
        ({} as { [P in keyof TMetadata]: Array<TMetadata[P]> })
      );
    },
  };
}

const buildEndpoints = <TContext, TMetadata extends Record<string, unknown>>(
  endpoints: ReadonlyArray<ep.AppEndpoint<TContext, TMetadata>>,
  regExpGroupNamePrefix?: string,
): PrefixedAppEndpointsInfo<TContext> => {
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
  <TContext>(
    builtEndpoints: PrefixedAppEndpointsInfo<TContext>["builtEndpoints"],
  ): ep.DynamicHandlerGetter<TContext> =>
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

interface PrefixedAppEndpointsInfo<TContext> {
  builtEndpoints: {
    regExpGroupName: string;
    handler: ep.DynamicHandlerGetter<TContext>;
  }[];
  regExpSource: string;
}
