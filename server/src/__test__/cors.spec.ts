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
  const handler = spec.createCORSHandlerGeneric(callbacks, {
    allowOrigin: "*",
    allowMethods: true,
  });
  const stateValidator = flowUtil.createStateValidator();
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: (method) => {
        return method === "OPTIONS"
          ? {
              found: "invalid-method",
              allowedMethods: [{ method: "GET", stateValidator }],
            }
          : {
              found: "handler" as const,
              handler: {
                stateValidator,
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
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
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
        "GET",
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
  const handler = spec.createCORSHandlerGeneric(callbacks, {
    allowOrigin: "*",
  });
  const stateValidator = flowUtil.createStateValidator();
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: (givenMethod) => {
        return givenMethod === method
          ? {
              found: "handler" as const,
              handler: {
                stateValidator,
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
              allowedMethods: [{ method, stateValidator }],
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
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [contextWithoutModifications, "content-type"],
      returnValue: undefined,
    },
    {
      callbackName: "getRequestBody",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyBody,
    },
    // This is called by CORS handler when reacting to onSuccessfulInvocationEnd event.
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Access-Control-Allow-Origin", "*"],
      returnValue: undefined,
    },
    // This is called by server flow again. Notice that CORS callback does *not* set status code since this is not a preflight request.
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 204, false],
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
  const handler = spec.createCORSHandlerGeneric(callbacks, {
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
        allowedMethods: [
          { method: "GET", stateValidator: flowUtil.createStateValidator() },
        ],
      }),
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // Two first invocations are by server flow
    {
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
    },
    // Now CORS flow kicks in, starting by asking method (since this is interpreted as pre-flight request)
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // CORS flow asks for origin header - because CORS options origin provider is a callback instead of static string
    {
      callbackName: "getHeader",
      args: [contextWithoutModifications, "origin"],
      returnValue: expectedRequestOrigin,
    },
    // CORS flow uses the origin that the callback provided
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Origin",
        "custom-origin",
      ],
      returnValue: undefined,
    },
    // CORS flow also sets the "Vary" header
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Vary", "Origin"],
      returnValue: undefined,
    },
    // CORS flow finally sets the status code
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 200, false],
      returnValue: undefined,
    },
  ]);
  c.deepEqual(seenRequestOrigin, expectedRequestOrigin);
});

test("Validate that CORS callbacks invoke custom allow headers callback", async (c) => {
  c.plan(2);
  const expectedRequestAllowHeaders = "header1,header2";
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "OPTIONS",
    getHeader: () => expectedRequestAllowHeaders,
  });
  let seenRequestAllowHeaders: data.ReadonlyHeaderValue;
  const handler = spec.createCORSHandlerGeneric(callbacks, {
    allowOrigin: "*",
    allowHeaders: (requestedHeaders) => {
      seenRequestAllowHeaders = requestedHeaders;
      return "header1";
    },
  });
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [
          { method: "GET", stateValidator: flowUtil.createStateValidator() },
        ],
      }),
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // Two first invocations are by server flow
    {
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
    },
    // Now CORS flow kicks in, starting by asking method (since this is interpreted as pre-flight request)
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // Next, origin is set (as it is simply static string)
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Access-Control-Allow-Origin", "*"],
      returnValue: undefined,
    },
    // CORS flow then asks for Access-Control-Request-Headers
    {
      callbackName: "getHeader",
      args: [contextWithoutModifications, "Access-Control-Request-Headers"],
      returnValue: expectedRequestAllowHeaders,
    },
    // CORS flow sets the Access-Control-Allow-Headers to the value provided by callback
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Headers",
        "header1",
      ],
      returnValue: undefined,
    },
    // CORS flow finally sets the status code
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 200, false],
      returnValue: undefined,
    },
  ]);
  c.deepEqual(seenRequestAllowHeaders, expectedRequestAllowHeaders);
});

test("Validate that CORS callbacks check for given callback before proceeding", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const handler = spec.createCORSHandlerGeneric(
    callbacks,
    {
      allowOrigin: "*",
    },
    // Filter which always just returns false
    () => false,
  );
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [
          { method: "GET", stateValidator: flowUtil.createStateValidator() },
        ],
      }),
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // All of the invocations are via server flow
    {
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "GET",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
    },
    // CORS flow does not kick in, so the server flow proceeds normally
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Allow", "GET"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 405, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate that CORS callbacks don't mistake normal method mismatch for preflight request", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const handler = spec.createCORSHandlerGeneric(callbacks, {
    allowOrigin: "*",
  });
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [
          { method: "GET", stateValidator: flowUtil.createStateValidator() },
        ],
      }),
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // Server flow starts by asking for URL and method
    {
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "GET",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
    },
    // CORS flow kicks in via onInvalidMethod event, asking for method as well
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "GET",
    },
    // CORS flow sets Allow-Origin
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Access-Control-Allow-Origin", "*"],
      returnValue: undefined,
    },
    // Server flow resumes again, setting Allow header and status code
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Allow", "GET"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 405, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate that CORS callbacks work for all static options", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "OPTIONS",
  });
  const allowMethods = ["POST", "PUT"] as const;
  const handler = spec.createCORSHandlerGeneric(callbacks, {
    allowOrigin: "*",
    allowHeaders: ["header1", "header2"],
    allowMethods,
    allowCredentials: true,
    exposeHeaders: ["header1"],
    maxAge: 1000,
  });
  await flow.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [
          ...allowMethods.map((method) => ({
            method,
            stateValidator: flowUtil.createStateValidator(),
          })),
        ],
      }),
    },
    callbacks,
    handler,
  )(flowUtil.inputContext);
  const contextWithoutModifications = flowUtil.seenContext;
  c.deepEqual(seenCallbacks, [
    // Server flow starts by asking for URL and method
    {
      callbackName: "getURL",
      args: [contextWithoutModifications],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [contextWithoutModifications, undefined],
      returnValue: "State",
    },
    // CORS flow kicks in via onInvalidMethod event invoked by utils.invokeInvalidMethodEvent, asking for method as well
    {
      callbackName: "getMethod",
      args: [contextWithoutModifications],
      returnValue: "OPTIONS",
    },
    // CORS flow detects this to be preflight request, and sets Allow-Origin, Expose-Headers, Allow-Credentials, Max-Age, Allow-Headers, and Allow-Methods headers.
    // It then also sets status code.
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Access-Control-Allow-Origin", "*"],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Expose-Headers",
        "header1",
      ],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Credentials",
        "true",
      ],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [contextWithoutModifications, "Access-Control-Max-Age", "1000"],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Headers",
        "header1,header2",
      ],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [
        contextWithoutModifications,
        "Access-Control-Allow-Methods",
        "POST,PUT",
      ],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [contextWithoutModifications, 200, false],
      returnValue: undefined,
    },
  ]);
});
