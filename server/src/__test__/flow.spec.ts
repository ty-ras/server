/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "../flow";
import * as stream from "stream";

test("Validate typicalServerFlow works", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: (method, groups) => ({
        found: "handler",
        handler: {
          contextValidator: {
            getState: (ctx) => ({ method, groups, ctx, state: "State" }),
            validator: () => ({
              error: "none",
              data: "Context2",
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
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "getHeader",
      args: ["Context2", contentType],
      returnValue: contentType,
    },
    {
      callbackName: "getRequestBody",
      args: ["Context2"],
      returnValue: dummyBody,
    },
    {
      callbackName: "setHeader",
      args: ["Context2", "response-header-name", "response-header-value"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: ["Context2", 200, true],
      returnValue: undefined,
    },
    {
      callbackName: "setHeader",
      args: ["Context2", "Content-Type", "contentType"],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: ["Context2", "output"],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid URL", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /no-named-groups-will-cause-error/,
      handler: () => {
        throw new Error("This shouldn't be called");
      },
    },
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "setStatusCode",
      args: ["Context", 404, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid method", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "invalid-method",
        allowedMethods: ["POST"],
      }),
    },
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "setHeader",
      args: ["Context", "Allow", "POST"],
      returnValue: undefined,
    },
    {
      callbackName: "setStatusCode",
      args: ["Context", 405, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid context", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "error",
              errorInfo: "Info",
              getHumanReadableMessage,
            }),
            getState: () => {
              throw new Error(errorMessage);
            },
          },
          handler: () => {
            throw new Error(errorMessage);
          },
        },
      }),
    },
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "setStatusCode",
      args: ["Context", 500, true],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: ["Context", undefined],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid context and custom error", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "protocol-error",
              body: "Body",
              statusCode: 403,
            }),
            getState: () => {
              throw new Error(errorMessage);
            },
          },
          handler: () => {
            throw new Error(errorMessage);
          },
        },
      }),
    },
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "setStatusCode",
      args: ["Context", 403, true],
      returnValue: undefined,
    },
    {
      callbackName: "sendContent",
      args: ["Context", "Body"],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid URL parameters", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "none",
              data: "Context2",
            }),
            getState: () => "State",
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
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "setStatusCode",
      args: ["Context2", 400, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid query parameters", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "none",
              data: "Context2",
            }),
            getState: () => "State",
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
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "setStatusCode",
      args: ["Context2", 400, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid headers", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "none",
              data: "Context2",
            }),
            getState: () => "State",
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
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "getHeader",
      args: ["Context2", "headername"],
      returnValue: "headername",
    },
    {
      callbackName: "setStatusCode",
      args: ["Context2", 400, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid body", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "none",
              data: "Context2",
            }),
            getState: () => "State",
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
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      callbackName: "getURL",
      args: ["Context"],
      returnValue: dummyURL,
    },
    {
      callbackName: "getState",
      args: ["Context"],
      returnValue: "State",
    },
    {
      callbackName: "getMethod",
      args: ["Context"],
      returnValue: "GET",
    },
    {
      callbackName: "getHeader",
      args: ["Context2", contentType],
      returnValue: contentType,
    },
    {
      callbackName: "getRequestBody",
      args: ["Context2"],
      returnValue: dummyBody,
    },
    {
      callbackName: "setStatusCode",
      args: ["Context2", 422, false],
      returnValue: undefined,
    },
  ]);
});

test("Validate typicalServerFlow works with invalid output", async (t) => {
  t.plan(1);
  const { seenCallbacks, callbacks } = createTrackingCallback();
  await spec.typicalServerFlow(
    "Context",
    {
      url: /(?<group>path)/,
      handler: () => ({
        found: "handler",
        handler: {
          contextValidator: {
            validator: () => ({
              error: "none",
              data: "Context2",
            }),
            getState: () => "State",
          },
          handler: () => ({
            error: "error",
            errorInfo: "Info",
            getHumanReadableMessage,
          }),
        },
      }),
    },
    undefined,
    callbacks,
  );
  t.deepEqual(seenCallbacks, [
    {
      args: ["Context"],
      callbackName: "getURL",
      returnValue: dummyURL,
    },
    {
      args: ["Context"],
      callbackName: "getState",
      returnValue: "State",
    },
    {
      args: ["Context"],
      callbackName: "getMethod",
      returnValue: "GET",
    },
    {
      args: ["Context2", contentType],
      callbackName: "getHeader",
      returnValue: contentType,
    },
    {
      args: ["Context2"],
      callbackName: "getRequestBody",
      returnValue: dummyBody,
    },
    {
      args: ["Context2", 500, false],
      callbackName: "setStatusCode",
      returnValue: undefined,
    },
  ]);
});

const createTrackingCallback = () => {
  const seenCallbacks: AllCallbacksArray = [];
  const callbacks: spec.ServerFlowCallbacks<unknown, unknown> = {
    getURL: (...args) => {
      const returnValue = dummyURL;
      seenCallbacks.push({ callbackName: "getURL", args, returnValue });
      return returnValue;
    },
    getState: (...args) => {
      const returnValue = "State";
      seenCallbacks.push({ callbackName: "getState", args, returnValue });
      return returnValue;
    },
    getMethod: (...args) => {
      const returnValue = "GET";
      seenCallbacks.push({ callbackName: "getMethod", args, returnValue });
      return returnValue;
    },
    getHeader: (...args) => {
      const returnValue = args[1];
      seenCallbacks.push({ callbackName: "getHeader", args, returnValue });
      return returnValue;
    },
    getRequestBody: (...args) => {
      const returnValue = dummyBody;
      seenCallbacks.push({ callbackName: "getRequestBody", args, returnValue });
      return returnValue;
    },
    setHeader: (...args) => {
      seenCallbacks.push({
        callbackName: "setHeader",
        args,
        returnValue: undefined,
      });
    },
    setStatusCode: (...args) => {
      seenCallbacks.push({
        callbackName: "setStatusCode",
        args,
        returnValue: undefined,
      });
    },
    sendContent: (...args) => {
      seenCallbacks.push({
        callbackName: "sendContent",
        args,
        returnValue: undefined,
      });
    },
  };

  return {
    seenCallbacks,
    callbacks,
  };
};

type AllCallbacksArray = Array<
  KeysAndValuesAsUnion<spec.ServerFlowCallbacks<unknown, unknown>>
>;

type KeysAndValuesAsUnion<T extends object> = {
  [P in keyof T]: {
    callbackName: P;
    args: T[P] extends (...args: any) => any ? Parameters<T[P]> : never;
    returnValue: T[P] extends (...args: any) => any ? ReturnType<T[P]> : never;
  };
}[keyof T];

const dummyBody = stream.Readable.from(["Body"]);

const dummyURL = "http://localhost/path";

const getHumanReadableMessage = () => "";

const errorMessage = "This should never be called";
const contentType = "content-type";
