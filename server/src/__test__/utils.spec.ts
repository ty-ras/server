/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test, { ExecutionContext } from "ava";
import * as spec from "../utils";
import type * as evt from "../events";
import type * as ep from "@ty-ras/endpoint";

test("Validate checkURLPathNameForHandler works for valid input", (t) => {
  t.plan(3);
  const urlString = "http://url";
  const ctx = "Context";
  const state = "State";
  withoutAndWithEvents(t, (emitter) => {
    const regExp = /(?<group>^\/$)/;
    t.deepEqual(
      spec.checkURLPathNameForHandler(ctx, state, emitter, urlString, regExp),
      {
        ctx,
        state,
        regExp,
        groups: {
          group: "/",
        },
      },
    );
  });
});
test("Validate checkURLPathNameForHandler works for invalid input", (t) => {
  t.plan(3);
  const urlString = "http://url";
  const ctx = "Context";
  const state = "State";
  withoutAndWithEvents(t, (emitter) => {
    const regExp = /no-match/;
    t.deepEqual(
      spec.checkURLPathNameForHandler(ctx, state, emitter, urlString, regExp),
      undefined,
    );
    return [
      {
        eventName: "onInvalidUrl",
        args: {
          ctx,
          state,
          regExp,
        },
      },
    ];
  });
});

test("Validate checkMethodForHandler works for valid input", (t) => {
  t.plan(3);
  withoutAndWithEvents(t, (emitter) => {
    const handler: ep.DynamicHandlerResponse<any> = {
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
    const handler: ep.DynamicHandlerResponse<any> = {
      found: "invalid-method",
      allowedMethods: [],
    };
    const retVal = spec.checkMethodForHandler(
      EVENT_ARGS,
      emitter,
      "GET",
      () => handler,
    );
    t.is(retVal, handler);
    return [
      {
        eventName: "onInvalidMethod",
        args: EVENT_ARGS,
      },
    ];
  });
});

test("Validate checkContextForHandler works for valid input", (t) => {
  t.plan(7);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkContextForHandler(EVENT_ARGS, emitter, {
      validator: (ctx) => {
        t.deepEqual(ctx, "Context");
        return { error: "none", data: "Context2" };
      },
      getState: (ctx) => {
        t.deepEqual(ctx, "Context2");
        return "State2";
      },
    });
    t.deepEqual(retVal, {
      result: "context",
      context: "Context2",
      state: "State2",
    });
  });
});
test("Validate checkContextForHandler works for invalid data input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkContextForHandler(EVENT_ARGS, emitter, {
      validator: (ctx) => {
        t.deepEqual(ctx, "Context");
        return {
          error: "error",
          errorInfo: "Info",
          getHumanReadableMessage,
        };
      },
      getState: () => {
        throw new Error("This should not be called");
      },
    });
    t.deepEqual(retVal, {
      result: "error",
      customStatusCode: undefined,
      customBody: undefined,
    });
    return [
      {
        eventName: "onInvalidContext",
        args: {
          ...EVENT_ARGS,
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
test("Validate checkContextForHandler works for invalid state input", (t) => {
  t.plan(5);
  withoutAndWithEvents(t, (emitter) => {
    const retVal = spec.checkContextForHandler(EVENT_ARGS, emitter, {
      validator: (ctx) => {
        t.deepEqual(ctx, "Context");
        return {
          error: "protocol-error",
          statusCode: 123,
          body: "Body",
        };
      },
      getState: () => {
        throw new Error("This should not be called");
      },
    });
    t.deepEqual(retVal, {
      result: "error",
      customStatusCode: 123,
      customBody: "Body",
    });
    return [
      {
        eventName: "onInvalidContext",
        args: {
          ...EVENT_ARGS,
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
  t.plan(7);
  withoutAndWithEvents(
    t,
    (emitter) => {
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
      const retVal2 = spec.checkURLParametersForHandler(EVENT_ARGS, emitter, {
        groupNames: {
          parameterName: "nonExistingGroup",
        },
        validators: {
          parameterName: () => {
            throw new Error("This should never be called");
          },
        },
      });
      t.deepEqual(retVal2, [false, {}]);
      const retVal3 = spec.checkURLParametersForHandler(EVENT_ARGS, emitter, {
        groupNames: {
          nonExistingParameterName: "groupName",
        },
        validators: {
          parameterName: () => {
            throw new Error("This should never be called");
          },
        },
      });
      t.deepEqual(retVal3, [false, {}]);
      return [
        {
          eventName: "onInvalidUrlParameters",
          args: {
            ...EVENT_ARGS,
            validationError: {
              error: "error",
              errorInfo: [
                {
                  error: "error",
                  errorInfo: "Info",
                  getHumanReadableMessage,
                },
              ],
              getHumanReadableMessage,
            },
          },
        },
        {
          eventName: "onInvalidUrlParameters",
          args: {
            ...EVENT_ARGS,
            validationError: {
              error: "error",
              errorInfo: [
                {
                  error: "error",
                  errorInfo: 'No regexp match for group "nonExistingGroup".',
                  getHumanReadableMessage,
                },
              ],
              getHumanReadableMessage,
            },
          },
        },
        {
          eventName: "onInvalidUrlParameters",
          args: {
            ...EVENT_ARGS,
            validationError: {
              error: "error",
              errorInfo: [
                {
                  error: "error",
                  errorInfo: 'No regexp match for group "undefined".',
                  getHumanReadableMessage,
                },
              ],
              getHumanReadableMessage,
            },
          },
        },
      ];
    },
    (seenEvents) => {
      // We have to do this since .deepEquals compares functions by-reference, and we can't access original value
      seenEvents.forEach((seenEvent, idx) => {
        (seenEvent.args as any).validationError.getHumanReadableMessage =
          getHumanReadableMessage;
        if (idx > 0) {
          (
            seenEvent.args as any
          ).validationError.errorInfo[0].getHumanReadableMessage = getHumanReadableMessage;
        }
      });
    },
  );
});

const createTrackingEvents = () => {
  const seenEvents: AllEventsArray = [];
  const emitter: evt.ServerEventEmitter<any, any> = {
    emit: (eventName, args) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      seenEvents.push({ eventName: eventName as any, args }),
  };
  return {
    seenEvents,
    emitter,
  };
};

type AllEventsArray = Array<
  KeysAndValuesAsUnion<evt.VirtualRequestProcessingEvents<any, any>>
>;

type KeysAndValuesAsUnion<T extends object> = {
  [P in keyof T]: { eventName: P; args: T[P] };
}[keyof T];

const withoutAndWithEvents = (
  t: ExecutionContext,
  runTest: (
    emitter: evt.ServerEventEmitter<any, any> | undefined,
  ) => AllEventsArray | void,
  postProcessEvents?: (seenEvents: AllEventsArray) => void,
) => {
  runTest(undefined);
  const { seenEvents, emitter } = createTrackingEvents();
  const expectedEvents = runTest(emitter) ?? [];
  postProcessEvents?.(seenEvents);
  t.deepEqual(seenEvents, expectedEvents);
};

const EVENT_ARGS: evt.EventArguments<any, any> = {
  ctx: "Context",
  state: "State",
  groups: {
    groupName: "groupValue",
  },
  regExp: /^$/,
};

const getHumanReadableMessage = () => "";
