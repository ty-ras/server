import test, { ExecutionContext } from "ava";
import * as spec from "..";
import * as common from "./common";
import * as md from "@ty-ras/metadata";

// These tests validate metadata aspects of all 4 stages of the builders.

const testWithSimpleEndpoint = (t: ExecutionContext, useBatch: boolean) => {
  t.plan(1);
  const responseBody = common.RESPONSE_BODY;
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, unknown>> = [];
  const endpointHandler = common.createSimpleEndpointHandler(seenArgs);
  const builder = spec
    .startBuildingAPI<unknown, string>()
    .withMetadataProvider(
      "string",
      createMetadataProvider(),
      (stateInfo) => stateInfo,
    );
  const starter = builder.atURL`/path`;
  const endpoint = (
    useBatch
      ? starter.batchSpec({
          state: common.state,
          method: "GET",
          endpointHandler,
          output: common.outputSpec(responseBody),
          mdArgs: {
            string: {
              url: undefined,
              query: undefined,
              requestHeaders: undefined,
              requestBody: undefined,
              responseBody: {
                string: responseBody,
              },
              responseHeaders: undefined,
            },
          },
        })
      : starter
          .forMethod("GET", common.state)
          .withoutBody(endpointHandler, common.outputSpec(responseBody), {
            string: {
              url: undefined,
              query: undefined,
              requestHeaders: undefined,
              requestBody: undefined,
              responseBody: {
                string: responseBody,
              },
              responseHeaders: undefined,
            },
          })
  ).createEndpoint({
    string: "SingleEndpointMetadata",
  });
  const mdResult = builder.getMetadataFinalResult(
    {
      string: "FinalResultArg",
    },
    [endpoint.getMetadata("URLPrefix")],
  );
  t.deepEqual(mdResult, {
    string: [
      "URLPrefix",
      "SingleEndpointMetadata",
      "/path",
      "GET",
      {
        inputSpec: undefined,
        metadataArguments: {
          query: undefined,
          requestBody: undefined,
          requestHeaders: undefined,
          responseBody: {
            string: "ResponseBody",
          },
          responseHeaders: undefined,
          url: undefined,
        },
        outputSpec: {
          contents: {
            string: "ResponseBody",
          },
        },
        querySpec: undefined,
        requestHeadersSpec: undefined,
        responseHeadersSpec: undefined,
      },
      "GET",
      "State",
      "FinalResultArg",
    ],
  });
};

const testWithComplexEndpoint = (t: ExecutionContext, useBatch: boolean) => {
  t.plan(1);
  const requestBody = "RequestBody";
  const responseBody = common.RESPONSE_BODY;
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, unknown>> = [];
  const endpointHandler = common.createComplexEndpointHandler(seenArgs);
  const builder = spec
    .startBuildingAPI<unknown, string>()
    .withMetadataProvider(
      "string",
      createMetadataProvider(),
      (stateInfo) => stateInfo,
    );
  const starter = builder.atURL`/path/${common.urlParam(
    "urlParam",
    "urlParamValue",
    /.*/,
  )}`;
  const query = common.stringDecoderSpec(
    {
      queryParam: "queryParamValue",
    },
    () => ({ required: true }),
  );
  const headers = common.stringDecoderSpec(
    {
      headerParam: "headerParamValue",
    },
    () => ({ required: true }),
  );
  const endpoint = (
    useBatch
      ? starter.batchSpec({
          state: common.state,
          method: "POST",
          endpointHandler: endpointHandler.handler,
          query,
          headers,
          input: common.inputSpec(requestBody),
          responseHeaders: endpointHandler.headers,
          output: common.outputSpec(responseBody, true),
          mdArgs: {
            string: {
              url: {
                urlParam: "URLParameterMetadata",
              },
              query: {
                queryParam: "QueryParameterMetadata",
              },
              requestHeaders: {
                headerParam: "HeaderParameterMetadata",
              },
              requestBody: {
                string: requestBody,
              },
              responseBody: {
                string: responseBody,
              },
              responseHeaders: {
                responseHeaderParam: "ResponseHeaderParameterMetadata",
              },
            },
          },
        })
      : starter
          .forMethod("POST", common.state, query, headers)
          .withBody(
            common.inputSpec(requestBody),
            endpointHandler,
            common.outputSpec(responseBody, true),
            {
              string: {
                url: {
                  urlParam: "URLParameterMetadata",
                },
                query: {
                  queryParam: "QueryParameterMetadata",
                },
                requestHeaders: {
                  headerParam: "HeaderParameterMetadata",
                },
                requestBody: {
                  string: requestBody,
                },
                responseBody: {
                  string: responseBody,
                },
                responseHeaders: {
                  responseHeaderParam: "ResponseHeaderParameterMetadata",
                },
              },
            },
          )
  ).createEndpoint({
    string: "SingleEndpointMetadata",
  });
  const mdResult = builder.getMetadataFinalResult(
    {
      string: "FinalResultArg",
    },
    [endpoint.getMetadata("URLPrefix")],
  );
  t.deepEqual(mdResult, {
    string: [
      "URLPrefix",
      // "InitialContext",
      "SingleEndpointMetadata",
      "/path/",
      "urlParam",
      "",
      "POST",
      {
        inputSpec: {
          contents: {
            string: "RequestBody",
          },
        },
        metadataArguments: {
          query: {
            queryParam: "QueryParameterMetadata",
          },
          requestBody: {
            string: "RequestBody",
          },
          requestHeaders: {
            headerParam: "HeaderParameterMetadata",
          },
          responseBody: {
            string: "ResponseBody",
          },
          responseHeaders: {
            responseHeaderParam: "ResponseHeaderParameterMetadata",
          },
          url: {
            urlParam: "URLParameterMetadata",
          },
        },
        outputSpec: {
          contents: {
            string: "ResponseBody",
          },
        },
        querySpec: {
          queryParam: {
            decoder: "queryParamValue",
            required: true,
          },
        },
        requestHeadersSpec: {
          headerParam: {
            decoder: "headerParamValue",
            required: true,
          },
        },
        responseHeadersSpec: {
          responseHeaderParam: {
            encoder: "responseHeaderParamValue",
            required: true,
          },
        },
      },
      "POST",
      "State",
      "FinalResultArg",
    ],
  });
};

test("Validate that simple adhoc flow works", testWithSimpleEndpoint, false);
test("Validate that simple batch flow works", testWithSimpleEndpoint, true);

test("Validate that complex adhoc flow works", testWithComplexEndpoint, false);
test("Validate that complex batch flow works", testWithComplexEndpoint, true);

interface MetadataHKT extends md.HKTArg {
  readonly type: MetadataConcrete<
    this["_TURLData"],
    this["_TQuery"],
    this["_TRequestHeaders"],
    this["_TBody"],
    this["_TResponseHeaders"],
    this["_TOutput"]
  >;
}

interface MetadataConcrete<
  TURL,
  TQuery,
  TRequestHeaders,
  TRequestBody,
  TResponseHeaders,
  TResponseBody,
> {
  url: TURL;
  query: TQuery;
  requestHeaders: TRequestHeaders;
  requestBody: TRequestBody;
  responseHeaders: TResponseHeaders;
  responseBody: TResponseBody;
}

// This is MD provider only for tests purpose.
// It simply collects all input it gets and returns it from getMetadataFinalResult call.
const createMetadataProvider = (): md.MetadataProvider<
  MetadataHKT,
  string,
  Array<
    | string
    | undefined
    | md.EndpointMetadataInformation<
        MetadataHKT,
        string,
        string,
        { string: string },
        { string: string }
      >
  >,
  string,
  string,
  { string: string },
  { string: string },
  string,
  string,
  Array<
    | string
    | undefined
    | md.EndpointMetadataInformation<
        MetadataHKT,
        string,
        string,
        { string: string },
        { string: string }
      >
  >
> => ({
  getEndpointsMetadata: (arg, url, methods) => (urlPrefix) =>
    [
      urlPrefix,
      arg,
      ...url.map((u) => (typeof u === "string" ? u : u.name)),
      ...Object.entries(methods)
        .map(([methodName, info]) => [methodName, info])
        .flat(),
    ],
  createFinalMetadata: (args, endpoints) => [
    ...endpoints.flatMap(({ md, stateMD }) => [
      ...md,
      ...Object.entries(stateMD).flatMap((entry) => entry),
    ]),
    args,
  ],
});
