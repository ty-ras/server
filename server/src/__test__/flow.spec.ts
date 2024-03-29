/**
 * @file This file contains unit tests for functionality in file `../flow.ts`.
 */

/* eslint-disable sonarjs/no-duplicate-string, @typescript-eslint/no-explicit-any */

import test, { ExecutionContext } from "ava";
import * as evtUtil from "./events";
import * as flowUtil from "./flow";
import * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";
import * as stream from "node:stream";
import * as spec from "../flow";

test("Validate typicalServerFlow works", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: (state) => ({
              error: "none",
              data: { method, groups, state },
            }),
          },
          handler: () => ({
            error: "none",
            data: {
              contentType: "contentType",
              output: "output",
              headers: {
                "response-header-name": "response-header-value",
              },
            },
          }),
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [flowUtil.seenContext, contentType],
      returnValue: contentType,
    },
    {
      callbackName: "getRequestBody",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyBody,
    },
    {
      callbackName: "setHeader",
      args: [
        flowUtil.seenContext,
        "response-header-name",
        "response-header-value",
      ],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 200, true],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Content-Type", "contentType"],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: [flowUtil.seenContext, "output"],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with special values", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } =
    flowUtil.createTrackingCallback("undefined");
  await flowUtil.createTypicalServerFlow(
    {
      url: flowUtil.dummyURLRegexp,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: (state) => ({
              error: "none",
              data: { method, groups, state },
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
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURLObject,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [flowUtil.seenContext, contentType],
      returnValue: undefined,
    },
    {
      callbackName: "getRequestBody",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyBody,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 204, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with special values 2", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback("array");
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: (state) => ({
              error: "none",
              data: { method, groups, state },
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
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURLObject,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [flowUtil.seenContext, contentType],
      returnValue: [contentType],
    },
    {
      callbackName: "getRequestBody",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyBody,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 204, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid URL", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /no-named-groups-will-match/,
      handler: () => {
        throw new Error(errorMessage);
      },
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 404, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid method", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [
          { method: "POST", stateInformation: flowUtil.createStateValidator() },
        ],
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Allow", "POST"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 405, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid state", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "error",
              errorInfo: "Info",
              getHumanReadableMessage,
            }),
          },
          handler: () => {
            throw new Error(errorMessage);
          },
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 500, true],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: [flowUtil.seenContext, undefined],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid state and custom error", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "protocol-error",
              body: "Body",
              statusCode: 403,
            }),
          },
          handler: () => {
            throw new Error(errorMessage);
          },
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 403, true],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: [flowUtil.seenContext, "Body"],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid URL parameters", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "none",
              data: "Context",
            }),
          },
          handler: () => {
            throw new Error(errorMessage);
          },
          urlValidator: {
            groupNames: {},
            validators: {
              urlParam: () => {
                throw new Error(errorMessage);
              },
            },
          },
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 400, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid query parameters", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "none",
              data: "Context",
            }),
          },
          handler: () => {
            throw new Error(errorMessage);
          },
          queryValidator: {
            queryParam: () => ({
              error: "error",
              errorInfo: "Info",
              getHumanReadableMessage,
            }),
          },
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 400, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid headers", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "none",
              data: "Context",
            }),
          },
          handler: () => {
            throw new Error(errorMessage);
          },
          headerValidator: {
            headerName: () => ({
              error: "error",
              errorInfo: "Info",
              getHumanReadableMessage,
            }),
          },
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [flowUtil.seenContext, "headername"],
      returnValue: "headername",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 400, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid body", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "none",
              data: "Context",
            }),
          },
          handler: () => {
            throw new Error(errorMessage);
          },
          bodyValidator: () =>
            Promise.resolve({
              error: "error",
              errorInfo: "Info",
              getHumanReadableMessage,
            }),
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [flowUtil.seenContext, contentType],
      returnValue: contentType,
    },
    {
      callbackName: "getRequestBody",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyBody,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 422, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid output", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "none",
              data: "Context",
            }),
          },
          handler: () => ({
            error: "error",
            errorInfo: "Info",
            getHumanReadableMessage,
          }),
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      args: [flowUtil.seenContext],
      callbackName: "getURL",
      returnValue: flowUtil.dummyURL,
    },
    {
      args: [flowUtil.seenContext],
      callbackName: "getMethod",
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      args: [flowUtil.seenContext, contentType],
      callbackName: "getHeader",
      returnValue: contentType,
    },
    {
      args: [flowUtil.seenContext],
      callbackName: "getRequestBody",
      returnValue: flowUtil.dummyBody,
    },
    {
      args: [flowUtil.seenContext, 500, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with throwing callback", async (t) => {
  t.plan(2);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const { seenEvents, emitter } = evtUtil.createTrackingEvents();
  const thrownError = new ThrownError();
  const regExp = /(?<group>\/path)/;
  await flowUtil.createTypicalServerFlow(
    {
      url: regExp,
      handler: () => {
        throw thrownError;
      },
    },
    callbacks,
    emitter,
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 500, false, thrownError],
      returnValue: undefined,
    },
  ]);
  t.deepEqual(seenEvents, [
    {
      eventName: "onException",
      args: {
        ctx: flowUtil.seenContext,
        regExp: /((?<e_0>^(?<group>\/path)$))/,
        error: thrownError,
      },
    },
  ]);
});

test("Validate typicalServerFlow works with throwing and throwing event emitter", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const thrownError = new ThrownError();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => {
        throw thrownError;
      },
    },
    callbacks,
    () => {
      throw new Error("This should be ignored");
    },
  )(flowUtil.inputContext);
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 500, false, thrownError],
      returnValue: undefined,
    },
  ]);
});

test("Validate that setting skipSettingStatusCode and skipSendingBody works", async (c) => {
  c.plan(2);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => {
        throw new Error("Just to simplify endpoint code");
      },
    },
    callbacks,
    (evtName, evtData) => {
      evtData.ctx.skipSettingStatusCode = true;
    },
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    // Notice - setStatusCode will not be called!
  ]);
  seenCallbacks.length = 0;
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: {
            stateInfo: undefined,
            validator: () => ({
              error: "protocol-error",
              body: "body",
              statusCode: 999,
            }),
          },
          handler: () => {
            throw new Error("This should never be called.");
          },
        },
      }),
    },
    callbacks,
    (evtName, evtData) => {
      evtData.ctx.skipSendingBody = true;
    },
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "setStatusCode",
      args: [
        {
          ...flowUtil.seenContext,
          skipSendingBody: true,
        },
        999,
        true,
      ],
      returnValue: undefined,
    },
    // Notice - sendContent will not be called!
  ]);
});

const validateServerFlowForHEADMethod = async (
  c: ExecutionContext,
  output: string | undefined | stream.Readable | Buffer,
  extraCalls: flowUtil.AllCallbacksArray,
  contentTypeSuffix: string | undefined = "utf-8",
) => {
  const isReadable = output instanceof stream.Readable;
  c.plan(isReadable ? 3 : 2);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "HEAD",
  });
  const seenMethods: Array<string> = [];
  const contentType = `contentType${
    contentTypeSuffix ? `; charset=${contentTypeSuffix}` : ""
  }`;
  const stateInformation = flowUtil.createStateValidator();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: (method) => {
        seenMethods.push(method);
        return method === "GET"
          ? {
              found: "handler",
              handler: {
                stateInformation,
                handler: () => ({
                  error: "none",
                  data: {
                    contentType,
                    output,
                    headers: {
                      "should-be-sent": "value",
                    },
                  },
                }),
              },
            }
          : {
              found: "invalid-method",
              allowedMethods: [{ method: "GET", stateInformation }],
            };
      },
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyURL,
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "HEAD",
    },
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    {
      callbackName: "getHeader",
      args: [flowUtil.seenContext, "content-type"],
      returnValue: undefined,
    },
    {
      callbackName: "getRequestBody",
      args: [flowUtil.seenContext],
      returnValue: flowUtil.dummyBody,
    },
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "should-be-sent", "value"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, output === undefined ? 204 : 200, false],
      returnValue: undefined,
    },
    ...extraCalls,
  ]);
  c.deepEqual(seenMethods, ["HEAD", "GET"]);
  if (isReadable) {
    c.true(output.destroyed);
  }
};

test(
  "Validate typicalServerFlow handles HEAD method correctly for empty response",
  validateServerFlowForHEADMethod,
  undefined,
  [
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Content-Length", "0"],
      returnValue: undefined,
    },
  ],
);

test(
  "Validate typicalServerFlow handles HEAD method correctly for string",
  validateServerFlowForHEADMethod,
  "Data",
  [
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Content-Length", "8"],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [
        flowUtil.seenContext,
        "Content-Type",
        "contentType; charset=utf16le",
      ],
      returnValue: undefined,
    },
  ],
  "utf16le",
);

test(
  "Validate typicalServerFlow handles HEAD method correctly for string without charset suffix",
  validateServerFlowForHEADMethod,
  "Data",
  [
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Content-Length", "4"],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Content-Type", "contentType"],
      returnValue: undefined,
    },
  ],
  "",
);

test(
  "Validate typicalServerFlow handles HEAD method correctly for Buffer",
  validateServerFlowForHEADMethod,
  Buffer.from("Hello", "utf-8"),
  [
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Content-Length", "5"],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: [
        flowUtil.seenContext,
        "Content-Type",
        "contentType; charset=utf-8",
      ],
      returnValue: undefined,
    },
  ],
);

test(
  "Validate typicalServerFlow handles HEAD method correctly for Readable",
  validateServerFlowForHEADMethod,
  flowUtil.dummyBody,
  [
    {
      callbackName: "setHeader",
      args: [
        flowUtil.seenContext,
        "Content-Type",
        "contentType; charset=utf-8",
      ],
      returnValue: undefined,
    },
  ],
);

test("Validate typicalServerFlow handles HEAD method correctly when no GET method available", async (c) => {
  c.plan(2);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "HEAD",
  });
  const seenMethods: Array<string> = [];
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: (method) => {
        seenMethods.push(method);
        return {
          found: "invalid-method",
          allowedMethods: [
            {
              method: "POST",
              stateInformation: flowUtil.createStateValidator(),
            },
          ],
        };
      },
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    // Server flow gets URL and method
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: "/path",
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "HEAD",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    // Since allowed methods did not contain "GET", normal procedure resumes to return 405 with Allow header set.
    {
      callbackName: "setHeader",
      args: [flowUtil.seenContext, "Allow", "POST"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 405, false],
      returnValue: undefined,
    },
  ]);
  c.deepEqual(seenMethods, ["HEAD"]);
});

test("Validate typicalServerFlow sends 404 when none of potential endpoint state validations passes", async (c) => {
  c.plan(2);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const seenMethods: Array<string> = [];
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: (method) => {
        seenMethods.push(method);
        return {
          found: "invalid-method",
          allowedMethods: [
            {
              method: "POST",
              stateInformation: {
                stateInfo: undefined,
                validator: () => ({
                  error: "error",
                  errorInfo: undefined,
                  getHumanReadableMessage,
                }),
              },
            },
          ],
        };
      },
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);

  c.deepEqual(seenCallbacks, [
    // Server flow gets URL and method
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: "/path",
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    // Server flow detects that no suitable method found, so it invokes utils.invokeInvalidMethodEvent, which in turn asks to get a state
    {
      callbackName: "getState",
      args: [flowUtil.seenContext, undefined],
      returnValue: "State",
    },
    // No 'Allow' header is set, but instead 404 is returned
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 404, false],
      returnValue: undefined,
    },
  ]);
  c.deepEqual(seenMethods, ["GET"]);
});

test("Validate typicalServerFlow works with thrown HTTPError", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const error = new dataBE.HTTPError(401, "body");
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: flowUtil.createStateValidator(),
          handler: () => {
            throw error;
          },
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    // Server flow gets URL and method
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: "/path",
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    // Server flow validates state
    {
      args: [flowUtil.seenContext, undefined],
      callbackName: "getState",
      returnValue: "State",
    },
    // Server flow gets content type
    {
      args: [flowUtil.seenContext, "content-type"],
      callbackName: "getHeader",
      returnValue: "content-type",
    },
    // Server flow gets request body
    {
      args: [flowUtil.seenContext],
      callbackName: "getRequestBody",
      returnValue: flowUtil.dummyBody,
    },
    // Server flow invokes the handler, which throws an error
    // Status code and body must propagate to response
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 401, true, error],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: [flowUtil.seenContext, "body"],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with returned HTTPProtocolError", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateInformation: flowUtil.createStateValidator(),
          handler: () => ({
            error: "protocol-error",
            statusCode: 401,
            body: "body",
          }),
        },
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    // Server flow gets URL and method
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: "/path",
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    // Server flow validates state
    {
      args: [flowUtil.seenContext, undefined],
      callbackName: "getState",
      returnValue: "State",
    },
    // Server flow gets content type
    {
      args: [flowUtil.seenContext, "content-type"],
      callbackName: "getHeader",
      returnValue: "content-type",
    },
    // Server flow gets request body
    {
      args: [flowUtil.seenContext],
      callbackName: "getRequestBody",
      returnValue: flowUtil.dummyBody,
    },
    // Server flow invokes the handler, which returns an error object.
    // Status code and body must propagate to response
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 401, true],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: [flowUtil.seenContext, "body"],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works when sendBody throws inside error handler", async (c) => {
  c.plan(1);
  const error = new dataBE.HTTPError(401, "body");
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getURL: () => "/path",
    sendContent: () => {
      throw new Error("This should be catched");
    },
  });
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => {
        throw error;
      },
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    // Server flow gets URL and method
    {
      callbackName: "getURL",
      args: [flowUtil.seenContext],
      returnValue: "/path",
    },
    {
      callbackName: "getMethod",
      args: [flowUtil.seenContext],
      returnValue: "GET",
    },
    // At this point handler throws HTTP error
    // Server flow catches error and invokes status code + send content callbacks
    // The send content callback will throw, and must be catched
    {
      callbackName: "setStatusCode",
      args: [flowUtil.seenContext, 401, true, error],
      returnValue: undefined,
    },
  ]);
});

test("Validate that handling OPTIONS works as intended by typicalServeFlow when invalid method returned", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "OPTIONS",
  });
  const allowedMethods = ["GET", "POST"] as const;
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: allowedMethods.map((method) => ({
          method,
          stateInformation: flowUtil.createStateValidator(),
        })),
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    {
      args: [flowUtil.seenContext],
      callbackName: "getURL",
      returnValue: "/path",
    },
    {
      args: [flowUtil.seenContext],
      callbackName: "getMethod",
      returnValue: "OPTIONS",
    },
    {
      args: [flowUtil.seenContext, "Allow", allowedMethods.join(",")],
      callbackName: "setHeader",
      returnValue: undefined,
    },
    {
      args: [flowUtil.seenContext, 200, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
});

test("Validate that handling OPTIONS works as intended by typicalServeFlow when no allowed methods returned", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getMethod: () => "OPTIONS",
  });
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [],
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    {
      args: [flowUtil.seenContext],
      callbackName: "getURL",
      returnValue: "/path",
    },
    {
      args: [flowUtil.seenContext],
      callbackName: "getMethod",
      returnValue: "OPTIONS",
    },
    {
      args: [flowUtil.seenContext, 404, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
});

test("Validate that handling OPTIONS works as intended by typicalServeFlow when no handlers returned", async (c) => {
  c.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.customizeTrackingCallback({
    getURL: () => "/will-not-match",
    getMethod: () => "OPTIONS",
  });
  await flowUtil.createTypicalServerFlow(
    {
      url: /(?<group>\/path)/,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: [],
      }),
    },
    callbacks,
    undefined,
  )(flowUtil.inputContext);
  c.deepEqual(seenCallbacks, [
    {
      args: [flowUtil.seenContext],
      callbackName: "getURL",
      returnValue: "/will-not-match",
    },
    {
      args: [flowUtil.seenContext, 404, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
});

test("Verify that typing for createTypicalServerFlow works", (c) => {
  const endpoints: ReadonlyArray<ep.AppEndpoint<never, undefined>> = [];
  const { callbacks } = flowUtil.createTrackingCallback();
  spec.createTypicalServerFlow<spec.TContextBase, undefined, undefined>(
    endpoints,
    callbacks,
    undefined,
  );
  const endpoints2: ReadonlyArray<
    ep.AppEndpoint<spec.TContextBase, undefined>
  > = [];
  spec.createTypicalServerFlow<spec.TContextBase, undefined, undefined>(
    endpoints2,
    callbacks,
    undefined,
  );
  spec.createTypicalServerFlow<spec.TContextBase, undefined, undefined>(
    [...endpoints, ...endpoints2],
    callbacks,
    undefined,
  );
  c.pass();
});

const getHumanReadableMessage = () => "";

const errorMessage = "This should never be called";
const contentType = "content-type";

class ThrownError extends Error {}
