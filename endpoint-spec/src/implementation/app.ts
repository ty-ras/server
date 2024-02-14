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
): api.ApplicationBuilderGeneric<
  TProtoEncodedHKT,
  TValidatorHKT,
  TStateHKT,
  TMetadataProviders,
  TServerContext,
  never,
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
    false,
  );

function newBuilderGenericImpl<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TServerContextPossible,
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
  processMethodArg: api.EndpointMethodProcessor<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContextPossible,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TEndpointSpecAdditionalDataHKT
  >,
  contextVisibleToEndpoints: false,
): api.ApplicationBuilderGeneric<
  TProtoEncodedHKT,
  TValidatorHKT,
  TStateHKT,
  TMetadataProviders,
  TServerContextPossible,
  never,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType,
  TEndpointSpecAdditionalDataHKT
>;

function newBuilderGenericImpl<
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
  processMethodArg: api.EndpointMethodProcessor<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContext,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TEndpointSpecAdditionalDataHKT
  >,
  contextVisibleToEndpoints: true,
): api.ApplicationBuilderGeneric<
  TProtoEncodedHKT,
  TValidatorHKT,
  TStateHKT,
  TMetadataProviders,
  TServerContext,
  TServerContext,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType,
  TEndpointSpecAdditionalDataHKT
>;

function newBuilderGenericImpl<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TServerContextPossible,
  TServerContextArg extends never,
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
  processMethodArg: api.EndpointMethodProcessor<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContextPossible,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TEndpointSpecAdditionalDataHKT
  >,
  contextVisibleToEndpoints: boolean,
): api.ApplicationBuilderGeneric<
  TProtoEncodedHKT,
  TValidatorHKT,
  TStateHKT,
  TMetadataProviders,
  TServerContextPossible,
  TServerContextArg,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType,
  TEndpointSpecAdditionalDataHKT
>;

function newBuilderGenericImpl<
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TServerContextPossible,
  TServerContextArg extends never,
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
  processMethodArg: api.EndpointMethodProcessor<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContextPossible,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TEndpointSpecAdditionalDataHKT
  >,

  contextVisibleToEndpoints: boolean,
):
  | api.ApplicationBuilderGeneric<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      TServerContextPossible,
      TServerContextArg,
      TAllRequestBodyContentTypes,
      TAllResponseBodyContentTypes,
      TDefaultRequestBodyContentType,
      TDefaultResponseBodyContentType,
      TEndpointSpecAdditionalDataHKT
    >
  | api.ApplicationBuilderGeneric<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      TServerContextPossible,
      never,
      TAllRequestBodyContentTypes,
      TAllResponseBodyContentTypes,
      TDefaultRequestBodyContentType,
      TDefaultResponseBodyContentType,
      TEndpointSpecAdditionalDataHKT
    > {
  // TODO we could use record instead of Array right here, to detect duplicate URL specs earlier
  const urlStates: Array<
    InternalStateForURL<
      TProtoEncodedHKT,
      TValidatorHKT,
      TStateHKT,
      TMetadataProviders,
      InternalRuntimeInfoForClasses
    >
  > = [];
  // Don't pass context to the bound method if not configured to do so
  const processMethod: typeof processMethodArg = contextVisibleToEndpoints
    ? processMethodArg
    : (pArgs) => {
        const boundMethod = processMethodArg(pArgs) ?? pArgs.boundMethod;
        return (args) => boundMethod(data.omit(args, "context") as any); // eslint-disable-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars
      };
  // Define resetMetadataProviders separately, as defining it inline causes problems with function overload having different argument count.
  const resetMetadataProviders: api.ApplicationBuilderGeneric<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    TServerContextPossible,
    TServerContextArg,
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
      TServerContextPossible,
      TServerContextArg,
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
      contextVisibleToEndpoints,
    );
  };

  // Return the public API to define and create endpoints
  return {
    // Context-related
    isContextVisibleToEndpoints: () => contextVisibleToEndpoints,
    hideContextForEndpoints: () =>
      newBuilderGenericImpl(
        defaultRequestBodyContentType,
        createRequestBodySpec,
        fromStateSpec,
        mdProviders,
        processMethodArg,
        false,
      ),
    showContextToEndpoints: () =>
      newBuilderGenericImpl(
        defaultRequestBodyContentType,
        createRequestBodySpec,
        fromStateSpec,
        mdProviders,
        processMethodArg,
        true,
      ),
    // General helpers
    requestBody: ((validation, requestBodyContentType) =>
      createRequestBodySpec(validation, {
        contentType: requestBodyContentType ?? defaultRequestBodyContentType,
      })) as api.AppRequestBodyCreator<
      TValidatorHKT,
      TDefaultRequestBodyContentType
    >,
    resetMetadataProviders,
    changeEndpointSpecAdditionalData: (
      newMethodProcessor: any, // TS can't infer correct type here
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      newBuilderGenericImpl(
        defaultRequestBodyContentType,
        createRequestBodySpec,
        fromStateSpec,
        mdProviders,
        newMethodProcessor, // eslint-disable-line @typescript-eslint/no-unsafe-argument
        contextVisibleToEndpoints,
      ) as any,

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

        // Implementation for decorators
        function endpointsForURL<
          TProtocolSpec extends api.GetProtocolBaseForURLData<
            api.GetURLData<TValidatorHKT, typeof args>
          >,
          TResponseBodyContentType extends TAllResponseBodyContentTypes,
          TRequestBodyContentType extends TAllRequestBodyContentTypes,
        >(
          this: void,
          mdArgs: api.GetEndpointMetadataArgs<
            TProtoEncodedHKT,
            TMetadataProviders,
            api.GetURLData<TValidatorHKT, typeof args>,
            TProtocolSpec,
            TRequestBodyContentType,
            TResponseBodyContentType
          >,
        ): api.ClassMethodDecoratorFactory<
          TProtoEncodedHKT,
          TValidatorHKT,
          TStateHKT,
          never,
          TRequestBodyContentType,
          TResponseBodyContentType,
          TEndpointSpecAdditionalDataHKT,
          TProtocolSpec
        > {
          return (specArg) => (method, context) => {
            addEndpointImplementation(
              fromStateSpec,
              processMethod as any, // eslint-disable-line @typescript-eslint/no-unsafe-argument
              urlState,
              mdArgs,
              specArg,
              { method, context },
            );
          };
        }

        // Implementation for inline endpoints
        const endpoint: api.ApplicationEndpointsForURL<
          TProtoEncodedHKT,
          TValidatorHKT,
          TStateHKT,
          TMetadataProviders,
          never,
          TAllRequestBodyContentTypes,
          TAllResponseBodyContentTypes,
          TDefaultRequestBodyContentType,
          TDefaultResponseBodyContentType,
          TEndpointSpecAdditionalDataHKT,
          api.GetURLData<TValidatorHKT, typeof args>
        >["endpoint"] = (mdArgs) => (specArg, implementation) => {
          const instance = new InlineEndpoint(implementation);
          addEndpointImplementation(
            fromStateSpec,
            processMethod as any, // eslint-disable-line @typescript-eslint/no-unsafe-argument
            urlState,
            mdArgs,
            specArg,
            {
              method: implementation,
              instance,
            },
          );
          return instance;
        };
        endpointsForURL.endpoint = endpoint;
        return endpointsForURL;
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
}

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
  patternSpec: md.URLPathPatternInfo;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ patternSpec, specsAndMetadatas: _, ...urlState }] =
      matchingEPInfos[0];
    const urlKey = `${
      curPrefix.length > 0 ? `[${curPrefix}]` : curPrefix
    }${patternSpec
      .map((fragmentOrParameter) =>
        typeof fragmentOrParameter === "string"
          ? `[${fragmentOrParameter}]`
          : `{}`,
      )
      .join("")}`;
    let epURLState = epURLStates[urlKey];
    if (!epURLState) {
      epURLState = {
        ...urlState,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        specsAndMetadatas: {} as any,
        // Don't modify original pattern spec info to enable re-using createEndpoints method.
        patternSpec: getActualPatternSpec(curPrefix, [...patternSpec]),
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
            `Only one URL decorator should be used for one class (${urlStateIndex} and ${idx}).`,
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
    // Is the first (if any) element non-empty string literal?
    const first = patternSpec[0];
    if (typeof first === "string" && first.length > 0) {
      // Modify the first element
      patternSpec[0] = `${prefix}${first}`;
    } else {
      // Insert the prefix as first element
      patternSpec.unshift(prefix);
    }
  }
  return patternSpec;
};

const addEndpointImplementation = <
  TProtoEncodedHKT extends protocol.EncodedHKTBase,
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateHKT extends dataBE.StateHKTBase,
  TMetadataProviders extends api.TMetadataProvidersBase,
  TServerContext,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TEndpointSpecAdditionalDataHKT extends api.EndpointSpecAdditionalDataHKTBase,
  TArgs extends api.TURLTemplateLiteralArgsBase<TValidatorHKT>,
  TProtocolSpec extends api.GetProtocolBaseForURLData<
    api.GetURLData<TValidatorHKT, TArgs>
  >,
  TResponseBodyContentType extends TAllResponseBodyContentTypes,
  TRequestBodyContentType extends TAllRequestBodyContentTypes,
  TStateSpec extends dataBE.MaterializeStateSpecBase<TStateHKT>,
  This extends object,
>(
  fromStateSpec: EndpointStateInformationFromStateSpec<TStateHKT>,
  processMethod: api.EndpointMethodProcessor<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TServerContext,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TEndpointSpecAdditionalDataHKT
  >,
  urlState: InternalStateForURL<
    TProtoEncodedHKT,
    TValidatorHKT,
    TStateHKT,
    TMetadataProviders,
    InternalRuntimeInfoForClasses
  >,
  mdArgs: api.GetEndpointMetadataArgs<
    TProtoEncodedHKT,
    TMetadataProviders,
    api.GetURLData<TValidatorHKT, TArgs>,
    TProtocolSpec,
    TRequestBodyContentType,
    TResponseBodyContentType
  >,
  specArg: api.GetEndpointSpec<
    TProtoEncodedHKT,
    TValidatorHKT,
    TRequestBodyContentType,
    TResponseBodyContentType,
    TEndpointSpecAdditionalDataHKT,
    TProtocolSpec,
    TStateSpec
  >,
  methodInfo:
    | {
        method: api.MethodForEndpoint<
          api.GetMethodArgsGeneric<
            TStateHKT,
            TServerContext,
            TProtocolSpec,
            TStateSpec
          >,
          This,
          api.GetMethodReturnType<TProtocolSpec>
        >;
        context: ClassMethodDecoratorContext<
          This,
          api.MethodForEndpoint<
            api.GetMethodArgsGeneric<
              TStateHKT,
              TServerContext,
              TProtocolSpec,
              TStateSpec
            >,
            This,
            api.GetMethodReturnType<TProtocolSpec>
          >
        >;
      }
    | {
        method: api.MethodForEndpoint<
          api.GetMethodArgsGeneric<
            TStateHKT,
            TServerContext,
            TProtocolSpec,
            TStateSpec
          >,
          void,
          api.GetMethodReturnType<TProtocolSpec>
        >;
        instance: This;
      },
) => {
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
      `Can not define different endpoints for same method "${spec.method}".`,
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
  if ("context" in methodInfo) {
    const { method, context } = methodInfo;
    context.addInitializer(function () {
      const boundMethod = method.bind(this);
      currentEndpointState.runtime.instances.push({
        instance: this,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
        boundMethod: (processMethod({
          spec,
          boundMethod,
        } as any) ?? boundMethod) as any,
      });
    });
  } else {
    const { method, instance } = methodInfo;
    currentEndpointState.runtime.instances.push({
      instance,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      boundMethod:
        (processMethod({
          spec: spec as any, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          boundMethod: method,
        }) as any) ?? method,
    });
  }
};

class InlineEndpoint<
  TStateHKT extends dataBE.StateHKTBase,
  TServerContext,
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, unknown>,
  TStateSpec extends dataBE.MaterializeStateSpecBase<TStateHKT>,
> implements
    api.InlineEndpointAdditionResult<
      TStateHKT,
      TServerContext,
      TProtocolSpec,
      TStateSpec
    >
{
  public constructor(
    public readonly implementation: api.InlineEndpointImplementation<
      TStateHKT,
      TServerContext,
      TProtocolSpec,
      TStateSpec
    >,
  ) {}
}
