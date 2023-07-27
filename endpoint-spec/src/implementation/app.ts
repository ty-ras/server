/**
 * @file This file contains most implementation of types defined in `../api.types` folder. The actual creation of single {@link ep.AppEndpoint} is in file `./endpoint.ts`.
 */

import type * as protocol from "@ty-ras/protocol";
import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import type * as md from "@ty-ras/metadata";
import type * as ep from "@ty-ras/endpoint";
import type * as api from "../api.types";
import buildEP, {
  type InternalStateForEndpointMethodRuntime,
  type URLParameterValidatorsAndMD,
  type BoundMethod,
} from "./endpoint";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

/**
 * Creates new instance of {@link api.ApplicationBuilder} with given inputs.
 * This function is used by other TyRAS plugins and usually not directly by client code.
 * @param defaultRequestBodyContentType The default request body content type string to use when invoking `createRequestBodySpec` callback.
 * @param createRequestBodySpec The callback to use to create {@link dataBE.DataValidatorRequestInputSpec}s.
 * @param fromStateSpec The callback to use to create {@link ep.EndpointStateInformation}s.
 * @param mdProviders The metadata providers that this builder will use.
 * @returns An object implementing {@link api.ApplicationBuilder} with given generic type arguments.
 */
export const newBuilderGeneric = <
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TServerContext,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
>(
  defaultRequestBodyContentType: TDefaultRequestBodyContentType,
  createRequestBodySpec: <T, TContentType extends string>(
    decoder: data.MaterializeDecoder<TValidatorHKT, T>,
    opts?: { contentType: TContentType },
  ) => dataBE.DataValidatorRequestInputSpec<T, TValidatorHKT, TContentType>,
  fromStateSpec: EndpointStateInformationFromStateSpec<TStateHKT>,
  mdProviders: {
    [P in keyof TMetadataProviders]: md.MetadataProvider<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders[P]
    >;
  },
): api.ApplicationBuilder<
  TProtoEncodedHKT,
  TValidatorHKT,
  TStateHKT,
  TMetadataProviders,
  TServerContext,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType,
  NoAdditionalSpecDataHKT
> =>
  newBuilderGenericImpl(
    defaultRequestBodyContentType,
    createRequestBodySpec,
    fromStateSpec,
    mdProviders,
    ({ boundMethod }) => boundMethod,
  );

const newBuilderGenericImpl = <
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TServerContext,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TEndpointSpecAdditionalDataHKT extends api.EndpointSpecAdditionalDataHKTBase,
>(
  defaultRequestBodyContentType: TDefaultRequestBodyContentType,
  createRequestBodySpec: <T, TContentType extends string>(
    validation: data.MaterializeDecoder<TValidatorHKT, T>,
    opts?: { contentType: TContentType },
  ) => dataBE.DataValidatorRequestInputSpec<T, TValidatorHKT, TContentType>,
  fromStateSpec: EndpointStateInformationFromStateSpec<TStateHKT>,
  mdProviders: {
    [P in keyof TMetadataProviders]: md.MetadataProvider<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders[P]
    >;
  },
  processMethod: api.EndpointMethodProcessor<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContext,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TEndpointSpecAdditionalDataHKT
  >,
): api.ApplicationBuilder<
  TProtoEncodedHKT,
  TValidatorHKT,
  TStateHKT,
  TMetadataProviders,
  TServerContext,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType,
  TEndpointSpecAdditionalDataHKT
> => {
  const urlStates: Array<
    InternalStateForURL<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      InternalRuntimeInfoForClasses
    >
  > = [];
  // Define resetMetadataProviders separately, as defining it inline causes problems with function overload having different argument count.
  const resetMetadataProviders: api.ApplicationBuilder<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContext,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT
  >["resetMetadataProviders"] = (mdProviders?: {}) => {
    return newBuilderGenericImpl<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      {},
      TServerContext,
      TAllRequestBodyContentTypes,
      TAllResponseBodyContentTypes,
      TDefaultRequestBodyContentType,
      TDefaultResponseBodyContentType,
      TEndpointSpecAdditionalDataHKT
    >(
      defaultRequestBodyContentType,
      createRequestBodySpec,
      fromStateSpec,
      mdProviders ?? {},
      processMethod,
    );
  };

  // Return the public API to define and create endpoints
  return {
    // General helpers
    requestBody: ((validation, requestBodyContentType) =>
      createRequestBodySpec(validation, {
        contentType: requestBodyContentType ?? defaultRequestBodyContentType,
      })) as api.AppRequestBodyCreator<
      TValidatorHKT,
      TDefaultRequestBodyContentType
    >,
    resetMetadataProviders,
    changeEndpointSpecAdditionalData: (newMethodProcessor) =>
      newBuilderGenericImpl(
        defaultRequestBodyContentType,
        createRequestBodySpec,
        fromStateSpec,
        mdProviders,
        newMethodProcessor,
      ),

    // Functionality related to defining and creating endpoints
    url: (fragments, ...args) => {
      return (urlMDArgs) => {
        const urlValidatorsAndMD = args.reduce<
          URLParameterValidatorsAndMD<TValidatorHKT>
        >(
          ({ urlValidators, urlMD }, { name, decoder, regExp, validator }) => {
            if (!urlValidators) {
              urlValidators = {};
            }
            urlValidators[name] = validator;
            urlMD[name] = {
              decoder,
              regExp,
            };
            return { urlValidators, urlMD };
          },
          { urlValidators: undefined, urlMD: {} },
        );
        const urlState: (typeof urlStates)[number] = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          specsAndMetadatas: {} as any,
          md: urlMDArgs,
          urlValidatorsAndMD,
          patternSpec: Array.from(generateURLPattern(fragments, args)),
        };
        urlStates.push(urlState);
        return (mdArgs) => (specArg) => (method, context) => {
          const spec = specArg as api.GetEndpointSpec<
            TProtoEncodedHKT,
            TValidatorHKT,
            string,
            string,
            TEndpointSpecAdditionalDataHKT,
            protocol.ProtocolSpecCore<protocol.HttpMethod, any> &
              protocol.ProtocolSpecQuery<protocol.TQueryDataBase> &
              protocol.ProtocolSpecRequestBody<any> &
              protocol.ProtocolSpecHeaderData<protocol.TRequestHeadersDataBase> &
              protocol.ProtocolSpecResponseHeaders<protocol.TResponseHeadersDataBase>,
            any
          >;
          if (spec.method in urlState.specsAndMetadatas) {
            throw new Error(
              `Can not define different endpoints fot same method "${spec.method}".`,
            );
          }

          // We have to do this to get typing right
          // Save current state - the initializer might run only after constuctor, if not static method
          const currentEndpointState: InternalStateForEndpointMethod<
            TProtoEncodedHKT,
            TValidatorHKT,
            TStateHKT,
            TMetadataProviders,
            InternalRuntimeInfoForClasses
          > = {
            metadata: {
              spec: {
                method: spec.method,
                responseBody: spec.responseBody.validatorSpec,
                query: spec.query?.metadata,
                requestBody: spec.requestBody?.validatorSpec,
                requestHeaders: spec.headers?.metadata,
                responseHeaders: spec.responseHeaders?.metadata,
                stateInfo: fromStateSpec(spec.state),
              },
              mdArgs,
            },
            runtime: {
              handlerInfo: {
                queryValidator: spec.query?.validators,
                bodyValidator: spec.requestBody?.validator,
                headerValidator: spec.headers?.validators,
              },
              responseInfo: {
                body: spec.responseBody.validator,
                headers: spec.responseHeaders?.validators,
              },
              instances: [],
            },
          };
          urlState.specsAndMetadatas[spec.method] = currentEndpointState;
          context.addInitializer(function () {
            currentEndpointState.runtime.instances.push({
              instance: this,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              boundMethod: processMethod({
                spec,
                boundMethod: method.bind(this),
              } as any),
            });
          });
        };
      };
    },
    createEndpoints: (mdArgs, ...args) => {
      const { endpoints, epMetadatas } = createEndpoints(
        mdProviders,
        urlStates,
        args,
      );
      return {
        endpoints,
        metadata: data.transformEntries(
          mdProviders,
          (mdProvider, mdProviderId) =>
            mdProvider.createFinalMetadata(
              mdArgs[mdProviderId],
              epMetadatas[mdProviderId],
            ),
        ),
      };
    },
  };
};

/**
 * This interface "implements" the generic [HKT](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again), {@link api.EndpointSpecAdditionalDataHKTBase}.
 * The implementation is in such way that no additional data is needed when using decorator on class method acting as BE endpoint.
 */
export interface NoAdditionalSpecDataHKT
  extends api.EndpointSpecAdditionalDataHKTBase {
  /**
   * This property "implements" the {@link api.EndpointSpecAdditionalDataHKTBase._getAdditionalEndpointSpecData} property in order to provide functionality for {@link api.MaterializeEndpointSpecAdditionalData} type.
   * The additional type specified by this property is simply empty object to signify that no extra data is needed.
   */
  readonly _getAdditionalEndpointSpecData: {};
}

/**
 * This is callback type to extract {@link ep.EndpointStateInformation} from given state specification.
 */
export type EndpointStateInformationFromStateSpec<
  TStateHKT extends dataBE.StateHKTBase,
> = <TStateSpec extends dataBE.MaterializeStateSpecBase<TStateHKT>>(
  stateSpec: TStateSpec,
) => ep.EndpointStateInformation<
  dataBE.MaterializeStateInfo<TStateHKT, TStateSpec>,
  dataBE.MaterializeRuntimeState<TStateHKT, TStateSpec>
>;

interface InternalStateForURL<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TRuntime extends object,
> {
  specsAndMetadatas: Record<
    protocol.HttpMethod,
    InternalStateForEndpointMethod<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      TRuntime
    >
  >;
  md: {
    [P in keyof TMetadataProviders]: md.MaterializeParameterWhenSpecifyingURL<
      TMetadataProviders[P],
      TProtoEncodedHKT,
      undefined | protocol.TURLDataBase
    >;
  };
  urlValidatorsAndMD: URLParameterValidatorsAndMD<TValidatorHKT>;
  patternSpec: MutableURLPathPatternInfo;
}

interface InternalStateForEndpointMethod<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TRuntime extends object,
> {
  metadata: {
    spec: md.SingleEndpointSpecMetadata<TValidatorHKT, TStateHKT>;
    mdArgs: {
      [P in keyof TMetadataProviders]: md.MaterializeParameterWhenSpecifyingEndpoint<
        TMetadataProviders[P],
        TProtoEncodedHKT,
        protocol.ProtocolSpecCore<protocol.HttpMethod, unknown>,
        string,
        string
      >;
    };
  };
  runtime: Omit<
    InternalStateForEndpointMethodRuntime<TStateHKT>,
    "stateInfo" | "boundMethod"
  > &
    TRuntime;
}

interface InternalRuntimeInfoForClasses {
  instances: Array<{
    instance: object;
    boundMethod: BoundMethod;
  }>;
}

interface InternalRuntimeInfoForEndpoints {
  boundMethod: BoundMethod;
}

type MutableURLPathPatternInfo = Array<md.URLPathPatternInfo[number]>;

function* generateURLPattern(
  fragments: ReadonlyArray<string>,
  args: ReadonlyArray<dataBE.URLParameterInfo<string, any, any>>,
): Generator<md.URLPathPatternInfo[number], void, unknown> {
  for (const [idx, fragment] of fragments.entries()) {
    yield fragment;
    if (idx < args.length) {
      yield { name: args[idx].name };
    }
  }
}

const createEndpoints = <
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TStateHKT extends dataBE.StateHKTBase,
>(
  mdProviders: {
    [P in keyof TMetadataProviders]: md.MetadataProvider<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders[P]
    >;
  },
  urlStates: ReadonlyArray<
    InternalStateForURL<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      InternalRuntimeInfoForClasses
    >
  >,
  allCreationArgs: Array<api.EndpointCreationArg>,
) => {
  const epMetadatas: {
    [P in keyof TMetadataProviders]: Array<
      md.MaterializeReturnWhenSpecifyingEndpoint<TMetadataProviders[P]>
    >;
  } = data.transformEntries(mdProviders, () => []);

  const epURLStates: Record<
    string,
    InternalStateForURL<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      InternalRuntimeInfoForEndpoints
    >
  > = {};
  function populateStatesAndMetadatas(
    curPrefix: string,
    args: ReadonlyArray<api.EndpointCreationArg>,
  ): void {
    args.forEach((arg) => {
      if (Array.isArray(arg)) {
        // This is multiple of arguments
        populateStatesAndMetadatas(curPrefix, arg);
      } else if (isClassOrInstanceOfClass(arg)) {
        // Argument leaf -> create the corresponding endpoint
        processEndpointClassOrInstance(curPrefix, arg);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (Object.getPrototypeOf(arg)?.[CONSTRUCTOR] === Object) {
        // This is URL-path-prefixed argument(s)
        Object.entries(
          // For some reason we need this explicit cast...
          arg as api.EndpointCreationArgNode,
        ).forEach(([prefix, nested]) => {
          populateStatesAndMetadatas(`${curPrefix}${prefix}`, [nested]);
        });
      } else {
        throw new Error(`Unsupported endpoint creation parameter: ${arg}.`);
      }
    });
  }

  function processEndpointClassOrInstance(
    curPrefix: string,
    arg: api.EndpointCreationArgLeafSingle,
  ) {
    // Find the correct builder and invoke the createEndpoint method
    const matchingEPInfos = Array.from(getMatchingEndpoints(urlStates, arg));

    if (matchingEPInfos.length === 0) {
      throw new Error(
        "The given class or instance was not augmented at all, or was instance of class with static methods, or was augmented with decorators from another application.",
      );
    }
    const [urlState] = matchingEPInfos[0];
    const urlKey = `${curPrefix}${urlState.patternSpec
      .map((fragmentOrParameter) =>
        typeof fragmentOrParameter === "string"
          ? `[${fragmentOrParameter}]`
          : `{${fragmentOrParameter.name}}`,
      )
      .join("")}`;
    let epURLState = epURLStates[urlKey];
    if (!epURLState) {
      epURLState = {
        ...urlState,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        specsAndMetadatas: {} as any,
        patternSpec: getActualPatternSpec(curPrefix, urlState.patternSpec),
      };
      epURLStates[urlKey] = epURLState;
    }
    for (const [
      ,
      method,
      {
        metadata,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        runtime: { instances: _, ...runtime },
      },
      boundMethod,
    ] of matchingEPInfos) {
      if (method in epURLState.specsAndMetadatas) {
        throw new Error(
          `Endpoint was specified for duplicate method "${method}" within URL pattern ${urlKey}.`,
        );
      }
      epURLState.specsAndMetadatas[method] = {
        metadata,
        runtime: {
          ...runtime,
          boundMethod,
        },
      };
    }
  }

  // Recursively process all given arguments
  populateStatesAndMetadatas("", allCreationArgs);
  // Build endpoints from populated states
  const endpoints = Object.values(epURLStates).map(
    ({ urlValidatorsAndMD, patternSpec, specsAndMetadatas, md }) => {
      // Register the metadata for this endpoint
      for (const [mdKey, epMetadata] of Object.entries(
        // We have to do this silly cast in order to Object.entries to work
        // Because Object.entries forces key type to be string
        epMetadatas as Record<
          string,
          (typeof epMetadatas)[keyof typeof epMetadatas]
        >,
      )) {
        // TODO we probably don't even need afterDefiningURLEndpoints method of MD provider.
        // But this refactor can be saved for 2.x or 3.0
        epMetadata.push(
          mdProviders[
            mdKey as keyof typeof mdProviders
          ].afterDefiningURLEndpoints(
            {
              url: urlValidatorsAndMD.urlMD,
              md: md[mdKey],
              patternSpec,
            },
            data.transformEntries(
              specsAndMetadatas,
              ({ metadata: { spec, mdArgs } }) => ({
                spec,
                md: mdArgs[mdKey],
              }),
            ),
          ),
        );
      }
      return buildEP(
        urlValidatorsAndMD,
        patternSpec,
        data.transformEntries(
          specsAndMetadatas,
          ({
            metadata: {
              spec: { stateInfo },
            },
            runtime,
          }) => ({
            ...runtime,
            stateInfo,
          }),
        ),
      );
    },
  );

  // Return the final results
  return {
    endpoints,
    epMetadatas,
  };
};

const isClassOrInstanceOfClass = (
  classOrInstance:
    | api.EndpointCreationArgLeafSingle
    | api.EndpointCreationArgNode,
): classOrInstance is api.EndpointCreationArgLeafSingle => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const proto = Object.getPrototypeOf(classOrInstance);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    (typeof classOrInstance === "function" &&
      // The .name is name of the class, will be empty string for "export default class { ... }"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof proto?.name === "string") ||
    (typeof classOrInstance === "object" &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof proto?.[CONSTRUCTOR] === "function" &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      proto[CONSTRUCTOR] !== Object)
  );
};

const CONSTRUCTOR = "constructor";

function* getMatchingEndpoints<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TStateHKT extends dataBE.StateHKTBase,
>(
  urlStates: ReadonlyArray<
    InternalStateForURL<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      InternalRuntimeInfoForClasses
    >
  >,
  arg: api.EndpointCreationArgLeafSingle,
) {
  let urlStateIndex = -1;
  for (const [idx, urlState] of urlStates.entries()) {
    for (const [method, epState] of Object.entries(
      urlState.specsAndMetadatas,
    )) {
      const instance = epState.runtime.instances.find(
        ({ instance }) => instance === arg,
      );
      if (instance) {
        if (urlStateIndex === -1) {
          urlStateIndex = idx;
        } else if (urlStateIndex != idx) {
          throw new Error(
            `Internal error: Found multiple URL patterns for same instance: ${urlStateIndex} and ${idx}.`,
          );
        }
        yield [
          urlState,
          method as protocol.HttpMethod,
          epState,
          instance.boundMethod,
        ] as const;
      }
    }
  }
}

const getActualPatternSpec = (
  prefix: string,
  patternSpec: MutableURLPathPatternInfo,
): MutableURLPathPatternInfo => {
  // Do anything only if prefix is something else than empty string
  if (prefix.length > 0) {
    // Is the first (if any) element string literal?
    const first = patternSpec[0];
    if (typeof first === "string") {
      // Modify the first element
      patternSpec[0] = `${prefix}${first}`;
    } else {
      // Insert the prefix as first element
      patternSpec.unshift(prefix);
    }
  }
  return patternSpec;
};
