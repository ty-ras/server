import * as start from "../start";
import * as dataIO from "../../data-backend-io-ts";
import type * as epSpec from "..";
import * as protocol from "./protocol";
import * as mdValidation from "./md-validation";

const app = start.newBuilder({});
type StateSpecBase = epSpec.StateSpecBaseOfAppBuilder<typeof app>;

const withURL = app.url`/something/${dataIO.urlParameter(
  "urlParam",
  protocol.urlParam,
)}`({
  openapi: {
    pathItem: {
      description: "Do something",
    },
    url: {
      urlParam: {
        description: "The URL param",
      },
    },
  },
});
const stateSpec = {
  userId: false,
} as const satisfies StateSpecBase;

// @withURL.endpoints
class MyClass {
  // Handler for ProtocolWithURL
  @withURL<protocol.SomeEndpoint>({
    openapi: {
      operation: { description: "Perform the thing" },
      responseBody: {
        description: "The response",
        mediaTypes: {
          "application/json": {
            example: "The example response",
          },
        },
      },
      query: {
        queryParam: { description: "The query param" },
      },
      responseHeaders: {
        responseHeader: { description: "The response header" },
      },
      requestBody: {
        "application/json": {
          example: new Date(0).toISOString(),
        },
      },
    },
  })({
    method: "GET",
    responseBody: dataIO.responseBody(protocol.responseBody),
    query: dataIO.query({
      queryParam: {
        decoder: protocol.queryParam,
        required: false,
      },
    }),
    responseHeaders: dataIO.responseHeaders({
      responseHeader: {
        encoder: protocol.resHeader,
        required: true,
      },
    }),
    requestBody: app.requestBody(protocol.requestBody),
    state: stateSpec,
  })
  static endpointWithUrl(
    args: epSpec.GetMethodArgs<
      protocol.SomeEndpoint,
      typeof withURL,
      typeof stateSpec
    >,
  ) {
    return {
      body: JSON.stringify({ args }),
      headers: {
        responseHeader: 42,
      },
    };
  }
}

export default app.createEndpoints(
  { openapi: mdValidation.infoObject },
  { "/api": MyClass },
);
