import * as ep from "@ty-ras/endpoint";
import * as dataBE from "@ty-ras/data-backend";
import * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";
import type * as state from "./state";
import type * as common from "./common";
import { AppEndpointBuilderInitial } from ".";

export class AppEndpointBuilder<
  TContext,
  TStateInfo,
  TArgsURL extends object,
  TAllowedMethods extends ep.HttpMethod,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends common.MetadataProvidersBase<
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents
  >,
> extends AppEndpointBuilderInitial<
  TContext,
  TStateInfo,
  TArgsURL,
  TAllowedMethods,
  TStringDecoder,
  TStringEncoder,
  TOutputContents,
  TInputContents,
  TMetadataProviders
> {
  public createEndpoint(mdArgs: {
    [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer TArg,
      unknown,
      infer _0,
      infer _1,
      infer _2,
      infer _3
    >
      ? TArg
      : never;
  }): common.AppEndpointWithMetadata<
    TContext,
    TStateInfo,
    {
      [P in keyof TMetadataProviders]: TMetadataProviders[P] extends md.MetadataProviderForEndpoints<
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
        infer TEndpointMD,
        infer _0,
        infer _1,
        infer _2,
        infer _3
      >
        ? TEndpointMD
        : never;
    }
  > {
    if (Object.keys(this._state.methods).length > 0) {
      const { urlValidation } = this._state;
      const metadata = constructMDResults(this._state, mdArgs);
      return {
        endpoint: {
          getRegExpAndHandler: (groupNamePrefix) => ({
            url: urlValidation
              ? buildURLRegExp(
                  this._state.fragments,
                  urlValidation.args,
                  urlValidation.validation,
                  groupNamePrefix,
                )
              : new RegExp(ep.escapeRegExp(this._state.fragments.join(""))),
            handler: (method) =>
              checkMethodsForHandler(
                this._state.methods,
                method,
                groupNamePrefix,
              ),
          }),
        },
        getMetadata: (urlPrefix) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          metadata: data.transformEntries(metadata, (md) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            md(urlPrefix),
          ) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          stateInfo: Object.fromEntries(
            Object.entries(this._state.methods).map(
              ([method, info]) => [method, info.stateInfo] as const,
            ),
          ),
        }),
      };
    } else {
      throw new NoMethodsForEndpointError();
    }
  }
}

const checkMethodsForHandler = <
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadataProviders extends common.MetadataProvidersBase<
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents
  >,
>(
  state: {
    [key: string]: state.StaticAppEndpointBuilderSpec<
      TContext,
      TStateInfo,
      TStringDecoder,
      TStringEncoder,
      TOutputContents,
      TInputContents,
      TMetadataProviders
    >;
  },
  method: ep.HttpMethod,
  groupNamePrefix: string,
): ep.DynamicHandlerResponse<TContext, TStateInfo> =>
  method in state
    ? {
        found: "handler" as const,
        handler: state[method].builder(groupNamePrefix),
      }
    : {
        found: "invalid-method" as const,
        allowedMethods: Object.keys(state) as Array<ep.HttpMethod>,
      };

function* getURLItemsInOrder<TStringDecoder>(
  fragments: ReadonlyArray<string>,
  names: ReadonlyArray<string>,
  validation: dataBE.URLParameterValidatorSpec<
    dataBE.RuntimeAnyURLData,
    TStringDecoder
  >,
) {
  for (const [idx, fragment] of fragments.entries()) {
    yield fragment;
    if (idx < names.length) {
      const name = names[idx];
      yield {
        name,
        validation: validation.validators[name],
        regExp: validation.metadata[name].regExp,
        decoder: validation.metadata[name].decoder,
      };
    }
  }
}

// For example, from URL string "/api/${id}" and the id parameter adhering to regexp X, build regexp:
// "/api/(?<ep_prefix_id>X)"
// Don't add start/end marks ^/$, since we want to allow prefixing URLs.
const buildURLRegExp = <TStringDecoder>(
  fragments: ReadonlyArray<string>,
  names: ReadonlyArray<string>,
  validation: dataBE.URLParameterValidatorSpec<
    dataBE.RuntimeAnyURLData,
    TStringDecoder
  >,
  groupNamePrefix: string,
) => {
  return new RegExp(
    Array.from(getURLItemsInOrder(fragments, names, validation)).reduce<string>(
      (currentRegExp, fragmentOrValidation) => {
        return `${currentRegExp}${
          typeof fragmentOrValidation === "string"
            ? ep.escapeRegExp(fragmentOrValidation)
            : `(?<${groupNamePrefix}${fragmentOrValidation.name}>${fragmentOrValidation.regExp.source})`
        }`;
      },
      "",
    ),
  );
};

const constructMDResults = <
  TContext,
  TStateInfo,
  TStringDecoder,
  TStringEncoder,
  TOutputContents extends dataBE.TOutputContentsBase,
  TInputContents extends dataBE.TInputContentsBase,
  TMetadata extends common.MetadataProvidersBase<
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents
  >,
>(
  {
    urlValidation,
    ...state
  }: state.AppEndpointBuilderState<
    TContext,
    TStateInfo,
    TStringDecoder,
    TStringEncoder,
    TOutputContents,
    TInputContents,
    TMetadata
  >,
  mdArgs: {
    [P in keyof TMetadata]: TMetadata[P] extends md.MetadataProviderForEndpoints<
      infer _, // eslint-disable-line @typescript-eslint/no-unused-vars
      infer TArg,
      unknown,
      infer _0,
      infer _1,
      infer _2,
      infer _3
    >
      ? TArg
      : never;
  },
) => {
  const urlSpec = urlValidation
    ? Array.from(
        getURLItemsInOrder(
          state.fragments,
          urlValidation.args,
          urlValidation.validation,
        ),
      ).map((fragmentOrValidation) =>
        typeof fragmentOrValidation === "string"
          ? fragmentOrValidation
          : data.omit(fragmentOrValidation, "validation"),
      )
    : [...state.fragments];

  return data.transformEntries(state.metadata, (md, mdKey) =>
    md.getEndpointsMetadata(
      mdArgs[mdKey],
      urlSpec,
      Object.fromEntries(
        Object.entries(state.methods).map(([method, methodInfo]) => {
          return [
            method,
            {
              requestHeadersSpec: methodInfo.requestHeadersSpec,
              responseHeadersSpec: methodInfo.responseHeadersSpec,
              querySpec: methodInfo.queryValidation,
              inputSpec: methodInfo.inputValidation,
              outputSpec: methodInfo.outputValidation,
              metadataArguments: methodInfo.mdArgs[mdKey],
            },
          ];
        }),
      ),
    ),
  );
};

export class NoMethodsForEndpointError extends Error {
  public constructor() {
    super("Please specify at least one method before building endpoint");
  }
}
