/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "../utils";
import type * as evt from "../events";

test("Validate checkURLPathNameForHandler works", (t) => {
  const urlString = "http://url";
  const regExp = /(^$)/;
  const ctx = "Context";
  const state = "State";
  t.deepEqual(
    spec.checkURLPathNameForHandler(ctx, state, undefined, urlString, regExp),
    {
      ctx,
      state,
      regExp,
      groups: {},
    },
  );
  const { seenEvents, emitter } = createTrackingEvents();
});

const createTrackingEvents = () => {
  const seenEvents: Array<
    KeysAndValuesAsUnion<evt.VirtualRequestProcessingEvents<any, any>>
  > = [];
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

type KeysAndValuesAsUnion<T extends object> = {
  [P in keyof T]: { eventName: P; args: T[P] };
}[keyof T];
