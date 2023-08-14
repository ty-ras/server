/**
 * @file This file contains tests for situations where class structure is correct, but usage scenarios should throw an error.
 */

import test from "ava";
import * as protocol from "./protocol";
import * as mp from "./missing-parts";

/* eslint-disable
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-return
*/

test("Verify that using async method works", async (c) => {
  c.plan(2);
  const app = mp.newBuilder({});
  const url = app.url`/api/endpoint`({});
  class Clazz {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    async endpoint() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "simpleResponseBody" as const;
    }
  }

  const { endpoints } = app.createEndpoints({}, new Clazz());
  c.deepEqual(endpoints.length, 1);
  const handler = endpoints[0].getRegExpAndHandler("blaa").handler("GET", {});
  if (handler.found === "handler") {
    const result = await handler.handler.handler({
      context: { req: "req", res: "res" },
      // state: "state",
      // url: undefined,
    } as any);
    c.deepEqual(result, {
      error: "none",
      data: {
        contentType: "text/plain",
        output: '"simpleResponseBody"',
      },
    });
  }
});
