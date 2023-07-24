import test from "ava";
import * as start from "../start";
import * as protocol from "./protocol";
import * as dataIO from "../../data-backend-io-ts";
import type * as epSpec from "..";

/* eslint-disable sonarjs/no-duplicate-string */

test("Validate that multiple methods work on a single class", (c) => {
  c.plan(4);
  const app = start.newBuilder({}).resetMetadataProviders();
  const url = app.url`/api/endpoint`({});
  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
    }

    @url<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint2() {
      return "";
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
  const app = start.newBuilder({}).resetMetadataProviders();
  const url = app.url`/api/endpoint`({});
  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
    }
  }

  const url2 = app.url`/api/endpoint2`({});
  class Class2 {
    @url2<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
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
  const app = start.newBuilder({}).resetMetadataProviders();
  const url = app.url`/api/endpoint`({});

  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
    }
  }

  class Class2 {
    @url<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
    }
  }

  const { endpoints } = app.createEndpoints({}, new Class(), new Class2());
  c.deepEqual(endpoints.length, 1);
});

test("Verify that mixing static and instance methods works as expected", (c) => {
  c.plan(9);
  const app = start.newBuilder({}).resetMetadataProviders();
  const url = app.url`/api/endpoint`({});

  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
    }

    @url<protocol.SimpleEndpoint2>({})({
      method: "POST",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    static staticEndpoint() {
      return "";
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
