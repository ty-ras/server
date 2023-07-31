/**
 * @file This file contains tests related to how URL parameters are specified in TyRAS builder.
 */

import test from "ava";
import * as data from "@ty-ras/data";
import type * as spec from "..";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";
import * as epValidation from "./endpoint-validation";

test("Verify that using URL parameter without prefix, and prefixing it in createEndpoints, works", async (c) => {
  c.plan(5);

  const app = mp.newBuilder({});
  const url = app.url`${mp.urlParameter("urlParam", protocol.urlParam)}`({});
  const state = {} as const satisfies spec.StateSpecBaseOfAppBuilder<
    typeof app
  >;

  class MyClass {
    public readonly seenArgs: Array<unknown> = [];
    @url<Endpoint>({})({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state,
    })
    endpoint(args: spec.GetMethodArgs<Endpoint, typeof url, typeof state>) {
      this.seenArgs.push(args);
      return "simpleResponseBody" as const;
    }
  }

  const instance = new MyClass();
  const { endpoints } = app.createEndpoints({}, { "/api/": instance });
  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => instance.seenArgs,
    "/api",
    // Remove body, query, and state from inputs as they are unused by this endpoint
    (info) => info.splice(3),
    // Expected output is also different
    {
      contentType: "text/plain",
      output: '"simpleResponseBody"',
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    (args) => data.omit(args, "body", "query") as any,
  );
});

type Endpoint = protocol.SimpleEndpoint & { url: { urlParam: "urlParam" } };
