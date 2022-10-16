/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test, { ExecutionContext } from "ava";
import * as spec from "../utils";
import type * as evt from "../events";
import * as evtUtil from "./events";
import type * as ep from "@ty-ras/endpoint";
import type * as dataBE from "@ty-ras/data-backend";
import type * as data from "@ty-ras/data";

import * as stream from "stream";

test("Validate checkURLPathNameForHandler works for valid input", (t) => {
  t.plan(5);
  const urlString = "http://url";
  const ctx = "Context";
  withoutAndWithEvents(t, (emitter) => {
    const regExp = /(?<group>^\/$)/;
    const expectedResult = {
      ctx,
      regExp,
      groups: {
        group: "/",
      },
    };
    t.deepEqual(
      spec.checkURLPathNameForHandler(ctx, emitter, urlString, regExp),
      expectedResult,
    );
    t.deepEqual(
      spec.checkURLPathNameForHandler(ctx, emitter, new URL(urlString), regExp),
      expectedResult,
    );
  });
});
test("Validate checkURLPathNameForHandler works for invalid input", (t) => {
  t.plan(3);
  const urlString = "http://url";
  const ctx = "Context";
  withoutAndWithEvents(t, (emitter) => {
    const regExp = /no-match/;
    t.deepEqual(
      spec.checkURLPathNameForHandler(ctx, emitter, urlString, regExp),
      undefined,
    );
    return [
      {
        eventName: "onInvalidUrl",
        args: {
          ctx,
          regExp,
        },
      },
    ];
  });
});

test("Validate checkMethodForHandler works for valid input", (t) => {
  t.plan(3);
  withoutAndWithEvents(t, (emitter) => {
    const handler: ep.DynamicHandlerResponse<any, any> = {
      found: "handler",
      handler: {} as any,
    };
    const retVal = spec.checkMethodForHandler(
      EVENT_ARGS,
      emitter,
      "GET",
      () => handler,
    );
    t.is(retVal, handler);
  });
});
test("Validate checkMethodForHandler works for invalid input", (t) => {
  t.plan(3);
  withoutAndWithEvents(t, (emitter) => {
    const handler: ep.DynamicHandlerResponse<any, any> = {
      found: "invalid-method",
      allowedMethods: [],
    };
    const retVal = spec.checkMethodForHandler(
      EVENT_ARGS_NO_STATE,
      emitter,
      "GET",
      () => handler,
    );
    t.is(retVal, handler);
    return [
      {
        eventName: "onInvalidMethod",
        args: EVENT_ARGS_NO_STATE,
      },
    ];
  });
});

test("Validate checkStateForHandler works for valid input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkStateForHandler(
      EVENT_ARGS_NO_STATE,
      emitter,
      (data) => {
        t.deepEqual(data, "State");
        return { error: "none", data };
      },
      "State",
    );
    t.deepEqual(retVal, {
      result: "state",
      state: "State",
    });
  });
});
test("Validate checkStateForHandler works for invalid data input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkStateForHandler(
      EVENT_ARGS_NO_STATE,
      emitter,
      (data) => {
        t.deepEqual(data, "State");
        return { error: "error", errorInfo: "Info", getHumanReadableMessage };
      },
      "State",
    );
    t.deepEqual(retVal, {
      result: "error",
      customStatusCode: undefined,
      customBody: undefined,
    });
    return [
      {
        eventName: "onInvalidState",
        args: {
          ...EVENT_ARGS_NO_STATE,
          validationError: {
            error: "error",
            errorInfo: "Info",
            getHumanReadableMessage,
          },
        },
      },
    ];
  });
});
test("Validate checkStateForHandler works for invalid data input with protocol information", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkStateForHandler(
      EVENT_ARGS_NO_STATE,
      emitter,
      (data) => {
        t.deepEqual(data, "State");
        return {
          error: "protocol-error",
          statusCode: 123,
          body: "Body",
        };
      },
      "State",
    );
    t.deepEqual(retVal, {
      result: "error",
      customStatusCode: 123,
      customBody: "Body",
    });
    return [
      {
        eventName: "onInvalidState",
        args: {
          ...EVENT_ARGS_NO_STATE,
          validationError: undefined,
        },
      },
    ];
  });
});

test("Validate checkURLParametersForHandler works for valid input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkURLParametersForHandler(EVENT_ARGS, emitter, {
      groupNames: {
        parameterName: "groupName",
      },
      validators: {
        parameterName: (data) => ({
          error: "none",
          data,
        }),
      },
    });
    t.deepEqual(retVal, [
      true,
      {
        parameterName: "groupValue",
      },
    ]);
    const retVal2 = spec.checkURLParametersForHandler(
      EVENT_ARGS,
      emitter,
      undefined,
    );
    t.deepEqual(retVal2, [true, undefined]);
  });
});

test("Validate checkURLParametersForHandler works for invalid parameter input", (t) => {
  t.plan(9);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkURLParametersForHandler(EVENT_ARGS, emitter, {
      groupNames: {
        parameterName: "groupName",
      },
      validators: {
        parameterName: () => ({
          error: "error",
          errorInfo: "Info",
          getHumanReadableMessage,
        }),
      },
    });
    t.deepEqual(retVal, [false, {}]);
    return [
      {
        eventName: "onInvalidUrlParameters",
        args: {
          ...EVENT_ARGS,
          validationError: {
            parameterName: [
              {
                error: "error",
                errorInfo: "Info",
                getHumanReadableMessage,
              },
            ],
          },
        },
      },
    ];
  });
  withoutAndWithEvents(
    t,
    (emitter) => {
      const retVal = spec.checkURLParametersForHandler(EVENT_ARGS, emitter, {
        groupNames: {
          parameterName: "nonExistingGroup",
        },
        validators: {
          parameterName: () => {
            throw new Error("This should never be called");
          },
        },
      });
      t.deepEqual(retVal, [false, {}]);
      return [
        {
          eventName: "onInvalidUrlParameters",
          args: {
            ...EVENT_ARGS,
            validationError: {
              parameterName: [
                {
                  error: "error",
                  errorInfo: 'No regexp match for group "nonExistingGroup".',
                  getHumanReadableMessage,
                },
              ],
            },
          },
        },
      ];
    },
    (seenEvents) => {
      // We have to do this since .deepEquals compares functions by-reference, and we can't access original value
      (
        seenEvents[0].args as any
      ).validationError.parameterName[0].getHumanReadableMessage = getHumanReadableMessage;
    },
  );
  withoutAndWithEvents(
    t,
    (emitter) => {
      const retVal = spec.checkURLParametersForHandler(EVENT_ARGS, emitter, {
        groupNames: {
          nonExistingParameterName: "groupName",
        },
        validators: {
          parameterName: () => {
            throw new Error("This should never be called");
          },
        },
      });
      t.deepEqual(retVal, [false, {}]);
      return [
        {
          eventName: "onInvalidUrlParameters",
          args: {
            ...EVENT_ARGS,
            validationError: {
              parameterName: [
                {
                  error: "error",
                  errorInfo: 'No regexp match for group "undefined".',
                  getHumanReadableMessage,
                },
              ],
            },
          },
        },
      ];
    },
    (seenEvents) => {
      // We have to do this since .deepEquals compares functions by-reference, and we can't access original value
      (
        seenEvents[0].args as any
      ).validationError.parameterName[0].getHumanReadableMessage = getHumanReadableMessage;
    },
  );
});

test("Validate checkQueryForHandler works for valid input", (t) => {
  t.plan(3);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkQueryForHandler(
      EVENT_ARGS,
      emitter,
      {
        queryParam: (queryValue) => ({
          error: "none",
          data: queryValue,
        }),
      },
      {
        queryParam: "queryValue",
      },
    );
    t.deepEqual(retVal, [
      true,
      {
        queryParam: "queryValue",
      },
    ]);
  });
});

test("Validate checkQueryForHandler works for invalid input", (t) => {
  t.plan(6);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkQueryForHandler(
      EVENT_ARGS,
      emitter,
      {
        queryParam: (queryValue) => ({
          error: "error",
          errorInfo: queryValue,
          getHumanReadableMessage,
        }),
      },
      {},
    );
    t.deepEqual(retVal, [false, {}]);
    return [
      {
        eventName: "onInvalidQuery",
        args: {
          ...EVENT_ARGS,
          validationError: {
            queryParam: {
              error: "error",
              errorInfo: undefined,
              getHumanReadableMessage,
            },
          },
        },
      },
    ];
  });
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkQueryForHandler(
      EVENT_ARGS,
      emitter,
      {
        queryParam: (queryValue) => ({
          error: "error",
          errorInfo: queryValue,
          getHumanReadableMessage,
        }),
      },
      {
        queryParam: "queryValue",
      },
    );
    t.deepEqual(retVal, [false, {}]);
    return [
      {
        eventName: "onInvalidQuery",
        args: {
          ...EVENT_ARGS,
          validationError: {
            queryParam: {
              error: "error",
              errorInfo: "queryValue",
              getHumanReadableMessage,
            },
          },
        },
      },
    ];
  });
});

test("Validate checkHeadersForHandler works with valid input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const seenHeaderNames: Array<string> = [];
    const retVal = spec.checkHeadersForHandler(
      EVENT_ARGS,
      emitter,
      {
        headerName: (headerValue) => ({
          error: "none",
          data: headerValue,
        }),
      },
      (headerName) => {
        seenHeaderNames.push(headerName);
        return "headerValue";
      },
    );
    // Notice that header name is lowercase! This is on purpose since many server frameworks lowercase the names.
    t.deepEqual(seenHeaderNames, ["headername"]);
    t.deepEqual(retVal, [true, { headerName: "headerValue" }]);
  });
});

test("Validate checkHeadersForHandler works with invalid input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const seenHeaderNames: Array<string> = [];
    const retVal = spec.checkHeadersForHandler(
      EVENT_ARGS,
      emitter,
      {
        headerName: (headerValue) => ({
          error: "error",
          errorInfo: headerValue,
          getHumanReadableMessage,
        }),
      },
      (headerName) => {
        seenHeaderNames.push(headerName);
        return "headerValue";
      },
    );
    // Notice that header name is lowercase! This is on purpose since many server frameworks lowercase the names.
    t.deepEqual(seenHeaderNames, ["headername"]);
    t.deepEqual(retVal, [false, {}]);
    return [
      {
        eventName: "onInvalidRequestHeaders",
        args: {
          ...EVENT_ARGS,
          validationError: {
            headerName: {
              error: "error",
              errorInfo: "headerValue",
              getHumanReadableMessage,
            },
          },
        },
      },
    ];
  });
});

test("Validate checkBodyForHandler works with valid input", async (t) => {
  t.plan(9);
  const bodyValidator: dataBE.DataValidatorRequestInput<unknown> = async ({
    contentType,
    input,
  }) => {
    const bodyStrings: Array<string> = [];
    for await (const chunk of input) {
      bodyStrings.push(
        chunk instanceof Buffer ? chunk.toString("utf8") : `${chunk}`,
      );
    }
    const bodyString = bodyStrings.join("");
    return {
      error: "none",
      data: {
        contentType,
        content: bodyString.length > 0 ? JSON.parse(bodyString) : undefined,
      },
    };
  };
  await withoutAndWithEventsAsync(t, async (emitter) => {
    // Without body, without validator
    const readable = stream.Readable.from(["dummy"]);
    const retVal = await spec.checkBodyForHandler(
      EVENT_ARGS,
      emitter,
      undefined,
      "anything",
      readable,
    );
    t.deepEqual(retVal, [true, undefined]);
    t.false(readable.readableDidRead, READABLE_MUST_NOT_BE_READ_MESSAGE);
    // Without body, but with validator
    const retVal2 = await spec.checkBodyForHandler(
      EVENT_ARGS,
      emitter,
      bodyValidator,
      "contentType",
      undefined,
    );
    t.deepEqual(retVal2, [
      true,
      {
        contentType: "contentType",
        content: undefined,
      },
    ]);
    // With body
    const body = { someProperty: "someValue" };
    const retVal3 = await spec.checkBodyForHandler(
      EVENT_ARGS,
      emitter,
      bodyValidator,
      "contentType",
      stream.Readable.from([JSON.stringify(body)]),
    );
    t.deepEqual(retVal3, [true, { contentType: "contentType", content: body }]);
  });
});

test("Validate checkBodyForHandler works with invalid input", async (t) => {
  t.plan(10);
  await Promise.all([
    await withoutAndWithEventsAsync(t, async (emitter) => {
      const readable = stream.Readable.from(["dummy"]);
      const retVal = await spec.checkBodyForHandler(
        EVENT_ARGS,
        emitter,
        ({ contentType }) =>
          Promise.resolve({
            error: "unsupported-content-type",
            supportedContentTypes: [contentType],
          }),
        "invalidContentType",
        readable,
      );
      t.deepEqual(retVal, [false, undefined]);
      t.false(readable.readableDidRead, READABLE_MUST_NOT_BE_READ_MESSAGE);
      return [
        {
          eventName: "onInvalidContentType",
          args: {
            ...EVENT_ARGS,
            contentType: "invalidContentType",
          },
        },
      ];
    }),
    await withoutAndWithEventsAsync(t, async (emitter) => {
      const readable = stream.Readable.from(["dummy"]);
      const retVal = await spec.checkBodyForHandler(
        EVENT_ARGS,
        emitter,
        ({ contentType }) =>
          Promise.resolve({
            error: "error",
            errorInfo: contentType,
            getHumanReadableMessage,
          }),
        "contentType",
        readable,
      );
      t.deepEqual(retVal, [false, undefined]);
      t.false(readable.readableDidRead, READABLE_MUST_NOT_BE_READ_MESSAGE);
      return [
        {
          eventName: "onInvalidBody",
          args: {
            ...EVENT_ARGS,
            validationError: {
              error: "error",
              errorInfo: "contentType",
              getHumanReadableMessage,
            },
          },
        },
      ];
    }),
  ]);
});

test("Validate invokeHandler works on valid output", async (t) => {
  t.plan(5);
  await withoutAndWithEventsAsync(t, async (emitter) => {
    const expectedArgs = {
      context: "Context",
      state: "State",
      url: {},
      headers: {},
      query: {},
      body: {},
    };
    const expectedOutput: data.DataValidatorResult<dataBE.DataValidatorResponseOutputSuccess> =
      {
        error: "none",
        data: {
          contentType: "contentType",
          output: "stringOutput",
        },
      };
    let seenArgs: any;
    const retVal = await spec.invokeHandler(
      EVENT_ARGS,
      emitter,
      (args) => {
        seenArgs = args;
        return expectedOutput;
      },
      expectedArgs,
    );
    t.is(seenArgs, expectedArgs);
    t.is(retVal, expectedOutput);
    return [
      {
        eventName: "onSuccessfulInvocationStart",
        args: EVENT_ARGS,
      },
      {
        eventName: "onSuccessfulInvocationEnd",
        args: EVENT_ARGS,
      },
    ];
  });
});

test("Validate invokeHandler works on invalid output", async (t) => {
  t.plan(5);
  await withoutAndWithEventsAsync(t, async (emitter) => {
    const expectedArgs = {
      context: "Context",
      state: "State",
      url: {},
      headers: {},
      query: {},
      body: {},
    };
    const expectedOutput: data.DataValidatorResult<dataBE.DataValidatorResponseOutputSuccess> =
      {
        error: "error",
        errorInfo: "Info",
        getHumanReadableMessage,
      };
    let seenArgs: any;
    const retVal = await spec.invokeHandler(
      EVENT_ARGS,
      emitter,
      (args) => {
        seenArgs = args;
        return expectedOutput;
      },
      expectedArgs,
    );
    t.is(seenArgs, expectedArgs);
    t.is(retVal, expectedOutput);
    return [
      {
        eventName: "onSuccessfulInvocationStart",
        args: EVENT_ARGS,
      },
      {
        eventName: "onInvalidResponse",
        args: {
          ...EVENT_ARGS,
          validationError: expectedOutput,
        },
      },
    ];
  });
});

const withoutAndWithEvents = (
  t: ExecutionContext,
  runTest: (
    emitter: evt.ServerEventEmitter<any, any> | undefined,
  ) => evtUtil.AllEventsArray | void,
  postProcessEvents?: (seenEvents: evtUtil.AllEventsArray) => void,
) => {
  runTest(undefined);
  const { seenEvents, emitter } = evtUtil.createTrackingEvents();
  const expectedEvents = runTest(emitter) ?? [];
  postProcessEvents?.(seenEvents);
  t.deepEqual(seenEvents, expectedEvents);
};

const withoutAndWithEventsAsync = async (
  t: ExecutionContext,
  runTest: (
    emitter: evt.ServerEventEmitter<any, any> | undefined,
  ) => Promise<evtUtil.AllEventsArray | void>,
  postProcessEvents?: (seenEvents: evtUtil.AllEventsArray) => void,
) => {
  await runTest(undefined);
  const { seenEvents, emitter } = evtUtil.createTrackingEvents();
  const expectedEvents = (await runTest(emitter)) ?? [];
  postProcessEvents?.(seenEvents);
  t.deepEqual(seenEvents, expectedEvents);
};

const EVENT_ARGS_NO_STATE: evt.EventArgumentsWithoutState<any> = {
  ctx: "Context",
  groups: {
    groupName: "groupValue",
  },
  regExp: /^$/,
};
const EVENT_ARGS: evt.EventArguments<any, any> = {
  ...EVENT_ARGS_NO_STATE,
  state: "State",
};

const getHumanReadableMessage = () => "";

const READABLE_MUST_NOT_BE_READ_MESSAGE =
  "The checkBodyForHandler should not read stream by itself.";
