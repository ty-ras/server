/**
 * @file This file contains tests related to context visibility using TyRAS builder.
 */

import test from "ava";
import type * as spec from "..";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";
import * as epValidation from "./endpoint-validation";

test("Verify that making context visible works", async (c) => {
  c.plan(6);

  const app = mp.newBuilder({}).makeContextVisibleToEndpoints();

  const url = app.url`/api/something/${mp.urlParameter(
    "urlParam",
    protocol.urlParam,
  )}`({});
  const state = {
    userId: true,
  } as const;
  const seenArgs: Array<
    spec.GetMethodArgs<protocol.SomeEndpoint, typeof url, typeof state>
  > = [];
  const endpoint = url.endpoint<protocol.SomeEndpoint>({})(
    {
      method: "GET",
      responseBody: mp.responseBody(protocol.responseBody),
      state,
      query: mp.query({
        queryParam: {
          decoder: protocol.queryParam,
          required: false,
        },
      }),
      requestBody: app.requestBody(protocol.requestBody),
      responseHeaders: mp.responseHeaders({
        responseHeader: {
          encoder: protocol.resHeader,
          required: true,
        },
      }),
    },
    (args) => {
      seenArgs.push(args);
      return {
        body: "responseBody",
        headers: {
          responseHeader: "resHeader",
        },
      } as const;
    },
  );

  const { endpoints } = app.createEndpoints({}, endpoint);
  c.deepEqual(
    endpoints.length,
    1,
    "There must be exactly one endpoint created by application builder.",
  );
  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => seenArgs,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true,
  );
});

test("Verify that hiding context  works", async (c) => {
  c.plan(6);

  const app = mp
    .newBuilder({})
    .makeContextVisibleToEndpoints()
    .noContextForEndpoints();

  const url = app.url`/api/something/${mp.urlParameter(
    "urlParam",
    protocol.urlParam,
  )}`({});
  const state = {
    userId: true,
  } as const;
  const seenArgs: Array<
    spec.GetMethodArgs<protocol.SomeEndpoint, typeof url, typeof state>
  > = [];
  const endpoint = url.endpoint<protocol.SomeEndpoint>({})(
    {
      method: "GET",
      responseBody: mp.responseBody(protocol.responseBody),
      state,
      query: mp.query({
        queryParam: {
          decoder: protocol.queryParam,
          required: false,
        },
      }),
      requestBody: app.requestBody(protocol.requestBody),
      responseHeaders: mp.responseHeaders({
        responseHeader: {
          encoder: protocol.resHeader,
          required: true,
        },
      }),
    },
    (args) => {
      seenArgs.push(args);
      return {
        body: "responseBody",
        headers: {
          responseHeader: "resHeader",
        },
      } as const;
    },
  );

  const { endpoints } = app.createEndpoints({}, endpoint);
  c.deepEqual(
    endpoints.length,
    1,
    "There must be exactly one endpoint created by application builder.",
  );
  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => seenArgs,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
  );
});
