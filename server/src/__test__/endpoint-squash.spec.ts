/**
 * @file This file contains tests for file `../prefix.ts`.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from "ava";
import type * as ep from "@ty-ras/endpoint";
import type * as protocol from "@ty-ras/protocol";
import spec from "../endpoint-squash";

test("Verify that one endpoint works for endpoint-squash", (t: ExecutionContext) => {
  t.plan(6);

  const url = /url/;
  const singleEP: ep.AppEndpointHandler<unknown, unknown> = {
    stateInformation: {
      stateInfo: undefined,
      validator: () => ({ error: "none", data: {} }),
    },
    handler: () => ({
      error: "none",
      data: {
        contentType: "application/json",
        output: "output",
      },
    }),
  };
  const responses: Partial<
    Record<
      protocol.HttpMethod,
      ep.AppEndpointHandlerGetterResult<unknown, unknown>
    >
  > = {
    // Create copies of singleEP because using t.is below
    GET: {
      found: "handler",
      handler: { ...singleEP },
    },
    POST: {
      found: "handler",
      handler: { ...singleEP },
    },
  };
  const prefixedHandler = spec([
    {
      getRegExpAndHandler: () => {
        return {
          url,
          handler: (method) => responses[method]!,
        };
      },
    },
  ]);
  const groupName = "e_0";
  t.deepEqual(prefixedHandler.url, new RegExp(`((?<${groupName}>^url$))`));
  for (const method of ["GET", "POST", "DELETE", "PUT", "OPTIONS"] as const) {
    const prefixedResponse = prefixedHandler.handler(
      method as protocol.HttpMethod,
      {
        [groupName]: "url",
      },
    );
    const expectedResponse = responses[method];
    if (expectedResponse) {
      t.is(
        prefixedResponse,
        expectedResponse,
        "Prefixed response must result in same underlying response",
      );
    } else {
      t.deepEqual(
        prefixedResponse,
        {
          found: INVALID_METHOD,
          // Prefixed handler doesn't really know which methods are accepted
          // This is perhaps something to be fixed later.
          // Although, the expectation and assumption of the prefixedHandler.handler method is that RegExp it gave has matched to URL.
          // Thus, this is a bit unrealistic test case.
          allowedMethods: [],
        },
        "Prefixed response must not be some extra handler",
      );
    }
  }
});

test("Verify that two endpoints works for endpoint-squash", (t: ExecutionContext) => {
  t.plan(11);

  const singleEP: ep.AppEndpointHandler<unknown, unknown> = {
    stateInformation: {
      stateInfo: undefined,
      validator: () => ({ error: "none", data: {} }),
    },
    handler: () => ({
      error: "none",
      data: {
        contentType: "application/json",
        output: "output",
      },
    }),
  };
  const responses: Partial<
    Record<
      protocol.HttpMethod,
      ep.AppEndpointHandlerGetterResult<unknown, unknown>
    >
  > = {
    // Create copies of singleEP because using t.is below
    GET: {
      found: "handler",
      handler: { ...singleEP },
    },
    POST: {
      found: "handler",
      handler: { ...singleEP },
    },
  };
  const urls = ["url", "the-url"];
  const prefixedHandler = spec([
    {
      getRegExpAndHandler: () => {
        return {
          url: new RegExp(urls[0]),
          handler: (method) => responses[method]!,
        };
      },
    },
    {
      getRegExpAndHandler: () => {
        return {
          url: new RegExp(urls[1]),
          handler: (method) => responses[method]!,
        };
      },
    },
  ]);
  const groupNames = ["e_0", "e_1"];
  t.deepEqual(
    prefixedHandler.url,
    new RegExp(
      `(${groupNames
        .map((groupName, idx) => `(?<${groupName}>^${urls[idx]}$)`)
        .join("|")})`,
    ),
  );
  for (const method of ["GET", "POST", "DELETE", "PUT", "OPTIONS"] as const) {
    for (const groupName of groupNames) {
      const prefixedResponse = prefixedHandler.handler(
        method as protocol.HttpMethod,
        {
          [groupName]: "will-be-ignored-because-no-url-parameter-parsing",
        },
      );
      const expectedResponse = responses[method];
      if (expectedResponse) {
        t.is(
          prefixedResponse,
          expectedResponse,
          "Prefixed response must result in same underlying response",
        );
      } else {
        t.deepEqual(
          prefixedResponse,
          {
            found: INVALID_METHOD,
            // Prefixed handler doesn't really know which methods are accepted
            // This is perhaps something to be fixed later.
            // Although, the expectation and assumption of the prefixedHandler.handler method is that RegExp it gave has matched to URL.
            // Thus, this is a bit unrealistic test case.
            allowedMethods: [],
          },
          "Prefixed response must not be some extra handler",
        );
      }
    }
  }
});

const INVALID_METHOD = "invalid-method";
