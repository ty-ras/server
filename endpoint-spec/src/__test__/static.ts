/**
 * @file This file contains the class with TyRAS-decorated methods for tests in "static.spec.ts" file.
 */

import type * as spec from "..";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";

const app = mp.newBuilder({});
type StateSpecBase = spec.StateSpecBaseOfAppBuilder<typeof app>;

const withURL = app.url`/something/${mp.urlParameter(
  "urlParam",
  protocol.urlParam,
)}`({});
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
    args: spec.GetMethodArgs<
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

export default app.createEndpoints({}, { "/api": MyClass });
