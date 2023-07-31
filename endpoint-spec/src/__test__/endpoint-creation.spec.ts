/**
 * @file This file contains tests related to creating new endpoints using TyRAS builder.
 */

import test from "ava";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";

test("Verify that using decorators on instance methods but passing class to endpoint builder produces meaningful error", (c) => {
  c.plan(1);
  const app = mp.newBuilder({});
  const url = app.url`/api/endpoint`({});
  class Class1 {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "simpleResponseBody" as const;
    }
  }

  class Class2 {
    @url<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "simpleResponseBody" as const;
    }
  }

  c.notThrows(() => {
    app.createEndpoints({}, { "/api2": [new Class1(), new Class2()] });
  });
});
