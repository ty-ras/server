/**
 * @file This file contains the class with TyRAS-decorated instance methods.
 */

import type * as spec from "..";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";

/* eslint-disable jsdoc/require-jsdoc */

export const app = mp.newBuilder({});
type StateSpecBase = spec.StateSpecBaseOfAppBuilder<typeof app>;

const withURL = app.url`/something/${mp.urlParameter(
  "urlParam",
  protocol.urlParam,
)}`({});
const stateSpec = {
  userId: false,
} as const satisfies StateSpecBase;

export class Endpoints {
  public constructor() {}

  public readonly seenArgs: Array<
    spec.GetMethodArgs<protocol.SomeEndpoint, typeof withURL, typeof stateSpec>
  > = [];

  @withURL<protocol.SomeEndpoint>({})({
    method: "GET",
    responseBody: mp.responseBody(protocol.responseBody),
    query: mp.query({
      queryParam: {
        decoder: protocol.queryParam,
        required: false,
      },
    }),
    responseHeaders: mp.responseHeaders({
      responseHeader: {
        encoder: protocol.resHeader,
        required: true,
      },
    }),
    requestBody: app.requestBody(protocol.requestBody),
    state: stateSpec,
  })
  endpointWithUrl(
    args: spec.GetMethodArgs<
      protocol.SomeEndpoint,
      typeof withURL,
      typeof stateSpec
    >,
  ) {
    this.seenArgs.push(args);
    return {
      body: "responseBody",
      headers: {
        responseHeader: "resHeader",
      },
    } as const;
  }
}

export const INSTANCE = new Endpoints();

export default app.createEndpoints(
  {},
  {
    "/api": INSTANCE,
  },
);
