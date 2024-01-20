/**
 * @file This file contains the inline implementation for TyRAS-powered app, without using decorators.
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

export const implementation: spec.InlineEndpointImplementation<
  mp.DefaultStateHKT,
  mp.ServerContext,
  protocol.SomeEndpoint,
  typeof stateSpec
> = (args) => {
  SEEN_ARGS.push(args);
  return {
    body: "responseBody",
    headers: {
      responseHeader: "resHeader",
    },
  } as const;
};

export const endpoint = withURL.endpoint<protocol.SomeEndpoint>({})(
  {
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
  },
  implementation,
);

export const SEEN_ARGS: Array<
  spec.GetMethodArgs<protocol.SomeEndpoint, typeof withURL, typeof stateSpec>
> = [];

export default app.createEndpoints(
  {},
  {
    "/api": endpoint,
  },
);
