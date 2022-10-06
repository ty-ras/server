import test from "ava";
import * as spec from "..";
import * as common from "./common";
import * as md from "@ty-ras/metadata";

// These tests validate metadata aspects of all 4 stages of the builders.

test("Validate that simple endpoint metadata works.", (t) => {
  t.plan(5);
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const builder = spec
    .bindNecessaryTypes(() => initialState)
    .withMetadataProvider("string", new MetadataProvider());
  const endpoint = builder.atURL`/path`
    .forMethod("GET")
    .withoutBody(
      (args) => (seenArgs.push(args), responseBody),
      common.outputSpec(responseBody),
      {
        string: {
          url: undefined,
          query: undefined,
          requestHeaders: undefined,
          requestBody: undefined,
          responseBody: {
            string: "ResponseBodyMetadata",
          },
          responseHeaders: undefined,
        },
      },
    )
    .createEndpoint({
      string: "URLEndpointMetadata",
    });
  const mdResult = builder.getMetadataFinalResult(
    {
      string: "FinalResultArg",
    },
    [endpoint.getMetadata("")],
  );
  t.deepEqual(mdResult, []);
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

class MetadataProvider extends md.InitialMetadataProviderClass<
  MetadataHKT,
  string,
  Array<string>,
  string,
  string,
  string,
  { string: string },
  { string: string },
  string,
  Array<string>
> {
  public constructor(context = "InitialContext") {
    super(
      context,
      (ctx) => ({
        getEndpointsMetadata: (arg, url, methods) => (urlPrefix) =>
          [
            ctx,
            arg,
            ...url.map((u) => (typeof u === "string" ? u : u.name)),
            ...Object.entries(methods).map(([methodName, info]) => methodName),
            urlPrefix,
          ],
      }),
      (ctx, args, endpoints) => [ctx, args, ...endpoints.flat()],
    );
  }
}
