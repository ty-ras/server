import test from "ava";
import * as spec from "..";
import * as common from "./common";
import * as md from "@ty-ras/metadata";

// These tests validate metadata aspects of all 4 stages of the builders.

test("Validate that simple endpoint metadata works.", (t) => {
  t.plan(1);
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const builder = spec
    .bindNecessaryTypes(() => initialState)
    .withMetadataProvider("string", new MetadataProvider());
  const endpoint = builder.atURL`/path`
    .forMethod("GET")
    .withoutBody<typeof responseBody>(
      (args) => (seenArgs.push(args), responseBody),
      common.outputSpec(responseBody),
      {
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
    )
    .createEndpoint({
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
      "InitialContext",
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
            string: "ResponseBodyMetadata",
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
      "InitialContext",
      "FinalResultArg",
    ],
  });
});

test("Validate that complex endpoint metadata works.", (t) => {
  t.plan(1);
  const requestBody = "RequestBody";
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const builder = spec
    .bindNecessaryTypes(() => initialState)
    .withMetadataProvider("string", new MetadataProvider());
  const endpoint = builder.atURL`/path/${"urlParam"}`
    .validateURLData(
      common.stringDecoderSpec(
        {
          urlParam: "urlParamValue",
        },
        () => ({
          regExp: /.*/,
        }),
      ),
    )
    .forMethod(
      "POST",
      common.stringDecoderSpec(
        {
          queryParam: "queryParamValue",
        },
        () => ({ required: true }),
      ),
      common.stringDecoderSpec(
        {
          headerParam: "headerParamValue",
        },
        () => ({ required: true }),
      ),
    )
    .withBody<typeof responseBody, typeof requestBody>(
      common.inputSpec(requestBody),
      (args) => (seenArgs.push(args), responseBody),
      common.outputSpec(responseBody),
      {
        string: {
          url: {
            urlParam: "",
          },
          query: {
            queryParam: "",
          },
          requestHeaders: {
            headerParam: "",
          },
          requestBody: {
            string: requestBody,
          },
          responseBody: {
            string: responseBody,
          },
          responseHeaders: undefined,
        },
      },
    )
    .createEndpoint({
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
      "InitialContext",
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
            string: "ResponseBodyMetadata",
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
      "InitialContext",
      "FinalResultArg",
    ],
  });
});

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
class MetadataProvider extends md.InitialMetadataProviderClass<
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
  string,
  { string: string },
  { string: string },
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
> {
  public constructor(context = "InitialContext") {
    super(
      context,
      (ctx) => ({
        getEndpointsMetadata: (arg, url, methods) => (urlPrefix) =>
          [
            urlPrefix,
            ctx,
            arg,
            ...url.map((u) => (typeof u === "string" ? u : u.name)),
            ...Object.entries(methods)
              .map(([methodName, info]) => [methodName, info])
              .flat(),
          ],
      }),
      (ctx, args, endpoints) => [...endpoints.flat(), ctx, args],
    );
  }
}
