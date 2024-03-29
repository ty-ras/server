/**
 * @file This file contains shared utility code for unit tests, related to functionality in `../flow.ts` file.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import * as flow from "../flow";
import type * as evt from "../events.types";
import * as stream from "node:stream";
import * as url from "node:url";
import * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";

/* eslint-disable jsdoc/require-jsdoc */
export const createTrackingCallback = (
  headerMode: "arg" | "array" | "undefined" = "arg",
) =>
  customizeTrackingCallback({
    getURL: () => {
      return headerMode === "arg" ? dummyURL : dummyURLObject;
    },
    getHeader: (...args) => {
      let returnValue;
      switch (headerMode) {
        case "arg":
          returnValue = args[1];
          break;
        case "undefined":
          returnValue = undefined;
          break;
        default:
          returnValue = [args[1]];
      }
      return returnValue;
    },
  });

export const customizeTrackingCallback = ({
  getURL,
  ...overrides
}: Partial<flow.ServerFlowCallbacks<unknown, unknown>> = {}) => {
  const seenCallbacks: AllCallbacksArray = [];
  const callbacks: flow.ServerFlowCallbacks<unknown, unknown> = {
    getURL: (...args) => {
      const returnValue = getURL ? getURL(...args) : dummyURL;
      seenCallbacks.push({
        callbackName: "getURL",
        args: deepCopyArgs(args),
        returnValue,
      });
      return returnValue;
    },
    getMethod: (...args) => {
      const returnValue = overrides.getMethod?.(...args) ?? "GET";
      seenCallbacks.push({
        callbackName: "getMethod",
        args: deepCopyArgs(args),
        returnValue,
      });
      return returnValue;
    },
    getState: (...args) => {
      const returnValue = overrides.getState?.(...args) ?? "State";
      seenCallbacks.push({
        callbackName: "getState",
        args: deepCopyArgs(args),
        returnValue,
      });
      return returnValue;
    },
    getHeader: (...args) => {
      const returnValue = overrides.getHeader?.(...args);
      seenCallbacks.push({
        callbackName: "getHeader",
        args: deepCopyArgs(args),
        returnValue,
      });
      return returnValue;
    },
    getRequestBody: (...args) => {
      const returnValue = overrides.getRequestBody?.(...args) ?? dummyBody;
      seenCallbacks.push({
        callbackName: "getRequestBody",
        args: deepCopyArgs(args),
        returnValue,
      });
      return returnValue;
    },
    setHeader: (...args) => {
      seenCallbacks.push({
        callbackName: "setHeader",
        args: deepCopyArgs(args),
        returnValue: overrides.setHeader?.(...args),
      });
    },
    setStatusCode: (...args) => {
      seenCallbacks.push({
        callbackName: "setStatusCode",
        args: deepCopyArgs(args),
        returnValue: overrides.setStatusCode?.(...args),
      });
    },
    sendContent: (...args) => {
      seenCallbacks.push({
        callbackName: "sendContent",
        args: deepCopyArgs(args),
        returnValue: overrides.sendContent?.(...args),
      });
    },
  };

  return {
    seenCallbacks,
    callbacks,
  };
};

export type AllCallbacksArray = Array<
  KeysAndValuesAsUnion<flow.ServerFlowCallbacks<unknown, unknown>>
>;

type KeysAndValuesAsUnion<T extends object> = {
  [P in keyof T]: {
    callbackName: P;
    args: T[P] extends (...args: any) => any ? Parameters<T[P]> : never;
    returnValue: T[P] extends (...args: any) => any ? ReturnType<T[P]> : never;
  };
}[keyof T];

export const dummyBody = stream.Readable.from(["Body"]);

export const dummyURL = "/path";
export const dummyURLObject = new url.URL(`http://example.com${dummyURL}`);
export const dummyURLRegexp = /(?<group_name>\/path)/;

export const inputContext = {
  context: "Context",
};

export const seenContext: flow.GetContext<typeof inputContext> = {
  ...inputContext,
  skipSettingStatusCode: false,
  skipSendingBody: false,
};

// Only copies first argument (context)
export const deepCopyArgs = <TArgs extends Array<any>>([
  first,
  ...remaining
]: TArgs): TArgs => [deepCopy(first), ...remaining] as TArgs;

export const deepCopy = <T>(value: T): T => {
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      value = value.map(deepCopy) as unknown as T;
    } else {
      value = (value === null
        ? null
        : data.transformEntries(
            value as unknown as object,
            deepCopy,
          )) as unknown as T;
    }
  }
  return value;
};

export const createStateValidator = (): ep.EndpointStateInformation<
  unknown,
  unknown
> => ({
  stateInfo: undefined,
  validator: () => ({
    error: "none",
    data: undefined,
  }),
});

export const createTypicalServerFlow = <
  TContext extends flow.TContextBase,
  TStateInfo,
  TState,
>(
  finalized: ep.FinalizedAppEndpoint<TContext, TStateInfo>,
  callbacks: flow.ServerFlowCallbacks<TContext, TStateInfo>,
  events: evt.ServerEventHandler<flow.GetContext<TContext>, TState> | undefined,
) =>
  flow.createTypicalServerFlow(
    [
      {
        getRegExpAndHandler: () => finalized,
      },
    ],
    callbacks,
    events,
  );
