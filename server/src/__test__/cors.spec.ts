/* eslint-disable sonarjs/no-duplicate-string */
import test from "ava";
import * as spec from "../cors";
import * as flowUtil from "./flow";
import * as flow from "../flow";
import type * as ep from "@ty-ras/endpoint";
import type * as data from "@ty-ras/data";

test("Validate that CORS callbacks intercept preflight call correctly", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "OPTIONS",
  });
  const handler = spec.createCORSHandler(callbacks, {
    allowOrigin: "*",
    allowMethods: true,
  });
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: (method) => {
        return method === "OPTIONS"
          ? {
              found: "invalid-method",
              allowedMethods: ["GET"],
            }
          : {
              found: "handler" as const,
              handler: {
                stateValidator: {
                  stateInfo: undefined,
                  validator: () => ({
                    error: "none",
                    data: undefined,
                  }),
                },
                handler: () => ({
                  error: "none",
                  data: {
                    contentType: "contentType",
                    output: undefined,
                  },
                }),
              },
            };
      },
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // This is called by server flow
    {
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    // This is called by server flow
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // At this point CORS handler will react to onInvalidMethod event.
    // This is called by CORS handler
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // This is called by CORS handler
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Access-Control-Allow-Origin", "*"],
      returnValue: undefined,
    },
    // This is called by CORS handler - only for preflight request
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Methods",
        ["GET"],
      ],
      returnValue: undefined,
    },
    // This is called by CORS handler - only for preflight request
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 200, false],
      returnValue: undefined,
    },
    // Notice a lack of setStatusCode call and also lack of setting "Allow" header by server flow - this is because CORS handler set `skipSettingStatusCode` of the context to true.
  ]);
});

test("Validate that CORS callbacks intercept normal call correctly", async (c) => {
  c.plan(1);
  const method: ep.HttpMethod = "GET";
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => method,
  });
  const handler = spec.createCORSHandler(callbacks, {
    allowOrigin: "*",
  });
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: (givenMethod) => {
        return givenMethod === method
          ? {
              found: "handler" as const,
              handler: {
                stateValidator: {
                  stateInfo: undefined,
                  validator: () => ({
                    error: "none",
                    data: undefined,
                  }),
                },
                handler: () => ({
                  error: "none",
                  data: {
                    contentType: "contentType",
                    output: undefined,
                  },
                }),
              },
            }
          : {
              found: "invalid-method",
              allowedMethods: [method],
            };
      },
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // Server flow calls these
    {
      args: [contextWithoutModifications],
      callbackName: "getURL",
      returnValue: flowUtil.dummyURL,
    },
    {
      args: [contextWithoutModifications],
      callbackName: "getMethod",
      returnValue: "GET",
    },
    {
      args: [contextWithoutModifications, undefined],
      callbackName: "getState",
      returnValue: "State",
    },
    {
      args: [contextWithoutModifications, "content-type"],
      callbackName: "getHeader",
      returnValue: undefined,
    },
    {
      args: [contextWithoutModifications],
      callbackName: "getRequestBody",
      returnValue: flowUtil.dummyBody,
    },
    // This is called by CORS handler when reacting to onSuccessfulInvocationEnd event.
    {
      args: [contextWithoutModifications, "Access-Control-Allow-Origin", "*"],
      callbackName: "setHeader",
      returnValue: undefined,
    },
    // This is called by server flow again. Notice that CORS callback does *not* set status code since this is not a preflight request.
    {
      args: [contextWithoutModifications, 204, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
});

test("Validate that CORS callbacks invoke custom origin callback", async (c) => {
  c.plan(2);
  const expectedRequestOrigin = "value-for-request-header-origin";
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "OPTIONS",
    getHeader: () => expectedRequestOrigin,
  });
  let seenRequestOrigin: data.ReadonlyHeaderValue;
  const handler = spec.createCORSHandler(callbacks, {
    allowOrigin: (originFromRequest) => {
      seenRequestOrigin = originFromRequest;
      return "custom-origin";
    },
  });
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: ["GET"],
      }),
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // Two first invocations are by server flow
    {
      args: [contextWithoutModifications],
      callbackName: "getURL",
      returnValue: flowUtil.dummyURL,
    },
    {
      args: [contextWithoutModifications],
      callbackName: "getMethod",
      returnValue: "OPTIONS",
    },
    // Now CORS flow kicks in, starting by asking method (since this is interpreted as pre-flight request)
    {
      args: [contextWithoutModifications],
      callbackName: "getMethod",
      returnValue: "OPTIONS",
    },
    // CORS flow asks for origin header - because CORS options origin provider is a callback instead of static string
    {
      args: [contextWithoutModifications, "origin"],
      callbackName: "getHeader",
      returnValue: expectedRequestOrigin,
    },
    // CORS flow uses the origin that the callback provided
    {
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Origin",
        "custom-origin",
      ],
      callbackName: "setHeader",
      returnValue: undefined,
    },
    // CORS flow also sets the "Vary" header
    {
      args: [contextWithoutModifications, "Vary", "Origin"],
      callbackName: "setHeader",
      returnValue: undefined,
    },
    // CORS flow finally sets the status code
    {
      args: [contextWithoutModifications, 200, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
  c.deepEqual(seenRequestOrigin, expectedRequestOrigin);
});
