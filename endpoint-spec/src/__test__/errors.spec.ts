/**
 * @file This file contains tests for situations where class structure is correct, but usage scenarios should throw an error.
 */

import test from "ava";
import * as protocol from "./protocol";
import * as mp from "./missing-parts";

test("Verify that using same protocol interface twice in a single class produces meaningful error", (c) => {
  c.plan(1);
  const app = mp.newBuilder({});
  const url = app.url`/api/endpoint`({});

  c.throws(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Class {
        @url<protocol.SimpleEndpoint>({})({
          method: "GET",
          responseBody: mp.responseBody(protocol.simpleResponseBody),
          state: {},
        })
        endpoint() {
          return "simpleResponseBody" as const;
        }

        @url<protocol.SimpleEndpoint>({})({
          method: "GET",
          responseBody: mp.responseBody(protocol.simpleResponseBody),
          state: {},
        })
        endpoint2() {
          return "simpleResponseBody" as const;
        }
      }
    },
    {
      instanceOf: Error,
      message: 'Can not define different endpoints fot same method "GET".',
    },
  );
});

test("Verify that using decorators on instance methods but passing class to endpoint builder produces meaningful error", (c) => {
  c.plan(1);
  const app = mp.newBuilder({});
  const url = app.url`/api/endpoint`({});
  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "simpleResponseBody" as const;
    }
  }

  c.throws(
    () => {
      app.createEndpoints({}, Class);
    },
    {
      instanceOf: Error,
      message:
        "The given class or instance was not augmented at all, or was instance of class with static methods, or was augmented with decorators from another application.",
    },
  );
});
