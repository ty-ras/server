/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test, { ExecutionContext } from "ava";
import * as spec from "../flow";
import * as evtUtil from "./events";
import * as flowUtil from "./flow";
import * as stream from "stream";

test("Validate typicalServerFlow works", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /^(?<group>\/)$/,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          stateValidator: {
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
      returnValue: undefined,
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: ["POST"],
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
  const regExp = /(?<group>path)/;
  await spec.createTypicalServerFlow(
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
        regExp,
        error: thrownError,
      },
    },
  ]);
});

test("Validate typicalServerFlow works with throwing and throwing event emitter", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = flowUtil.createTrackingCallback();
  const thrownError = new ThrownError();
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          stateValidator: {
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
      args: [flowUtil.seenContext, undefined],
      callbackName: "getState",
      returnValue: "State",
    },
    {
      args: [
        {
          ...flowUtil.seenContext,
          skipSendingBody: true,
        },
        999,
        true,
      ],
      callbackName: "setStatusCode",
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: (method) => {
        seenMethods.push(method);
        return method === "GET"
          ? {
              found: "handler",
              handler: {
                stateValidator: {
                  stateInfo: undefined,
                  validator: () => ({
                    error: "none",
                    data: "Context",
                  }),
                },
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
              allowedMethods: ["GET"],
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
  await spec.createTypicalServerFlow(
    {
      url: /(?<group>path)/,
      handler: (method) => {
        seenMethods.push(method);
        return {
          found: "invalid-method",
          allowedMethods: ["POST"],
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

const getHumanReadableMessage = () => "";

const errorMessage = "This should never be called";
const contentType = "content-type";

class ThrownError extends Error {}
