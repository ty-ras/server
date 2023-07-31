/**
 * @file This file contains tests for situations where class structure is incorrect.
 */

import test from "ava";
import * as protocol from "./protocol";
import * as mp from "./missing-parts";
import type * as epSpec from "..";

/* eslint-disable sonarjs/no-duplicate-string */

test("Validate that multiple methods work on a single class", (c) => {
  c.plan(4);
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

    @url<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint2() {
      return "simpleResponseBody" as const;
    }
  }

  const { endpoints } = app.createEndpoints({}, new Class());
  c.deepEqual(endpoints.length, 1);
  const endpoint = endpoints[0].getRegExpAndHandler("");
  c.deepEqual(endpoint.handler("GET", {}).found, "handler");
  c.deepEqual(endpoint.handler("POST", {}).found, "handler");
  c.deepEqual(endpoint.handler("PUT", {}).found, "invalid-method");
});

test("Validate that multiple classes work", (c) => {
  c.plan(5);
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

  const url2 = app.url`/api/endpoint2`({});
  class Class2 {
    @url2<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "simpleResponseBody" as const;
    }
  }

  const { endpoints } = app.createEndpoints({}, new Class(), new Class2());
  c.deepEqual(endpoints.length, 2);
  const endpoint = endpoints[0].getRegExpAndHandler("");
  c.deepEqual(endpoint.handler("GET", {}).found, "handler");
  c.deepEqual(endpoint.handler("POST", {}).found, "invalid-method");
  const endpoint2 = endpoints[1].getRegExpAndHandler("");
  c.deepEqual(endpoint2.handler("POST", {}).found, "handler");
  c.deepEqual(endpoint2.handler("GET", {}).found, "invalid-method");
});

test("Verify that using decorators fom same URL on multiple different classes works", (c) => {
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

  const { endpoints } = app.createEndpoints({}, new Class(), new Class2());
  c.deepEqual(endpoints.length, 1);
});

test("Verify that mixing static and instance methods works as expected", (c) => {
  c.plan(9);
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

    @url<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    static staticEndpoint() {
      return "simpleResponseBody" as const;
    }
  }
  const createAndVerifyEndpoints = (
    resultGET: "handler" | "invalid-method",
    resultPOST: "handler" | "invalid-method",
    ...args: [epSpec.EndpointCreationArg, ...Array<epSpec.EndpointCreationArg>]
  ) => {
    const { endpoints } = app.createEndpoints({}, ...args);
    c.deepEqual(endpoints.length, 1);
    const endpoint = endpoints[0].getRegExpAndHandler("");
    c.deepEqual(endpoint.handler("GET", {}).found, resultGET);
    c.deepEqual(endpoint.handler("POST", {}).found, resultPOST);
  };
  // Verify that enabling both static and instance method works
  createAndVerifyEndpoints("handler", "handler", Class, new Class());
  // Verify that enabling only static method works
  createAndVerifyEndpoints("invalid-method", "handler", Class);
  // Verify that enabling only instance method works
  createAndVerifyEndpoints("handler", "invalid-method", new Class());
});
