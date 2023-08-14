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
      message: 'Can not define different endpoints for same method "GET".',
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

test("Verify that passing wrong parameters to createEndpoints throws an error", (c) => {
  c.plan(1);
  const app = mp.newBuilder({});
  c.throws(() => app.createEndpoints({}, "i am wrong argument" as any), {
    instanceOf: Error,
    message: "Unsupported endpoint creation parameter: i am wrong argument.",
  });
});

test("Verify that using same protocol interface twice in same class a different url builders produces meaningful error", (c) => {
  c.plan(1);
  const app = mp.newBuilder({});
  const url = app.url`/api/endpoint`({});
  const url2 = app.url`/api/endpoint`({});
  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "simpleResponseBody" as const;
    }

    @url2<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint2() {
      return "simpleResponseBody" as const;
    }
  }
  c.throws(
    () => {
      app.createEndpoints({}, new Class());
    },
    {
      instanceOf: Error,
      message: "Only one URL decorator should be used for one class (0 and 1).",
    },
  );
});

test("Verify that using same protocol interface twice in different class a different url builders produces meaningful error", (c) => {
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

  const url2 = app.url`/api/endpoint`({});
  class Class2 {
    @url2<protocol.SimpleEndpoint>({})({
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
      app.createEndpoints({}, new Class1(), new Class2());
    },
    {
      instanceOf: Error,
      message:
        'Endpoint was specified for duplicate method "GET" within URL pattern [/api/endpoint].',
    },
  );
});

test("Verify that returning non-conforming response body in endpoint method is returned", async (c) => {
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
      return "invalidResponseBody" as any;
    }
  }

  const handler = app
    .createEndpoints({}, new Class())
    .endpoints[0].getRegExpAndHandler("")
    .handler("GET", {});
  if (handler.found === "handler") {
    c.like(await handler.handler.handler({} as any), {
      error: "error",
      errorInfo: "invalidResponseBody",
    });
  }
});
