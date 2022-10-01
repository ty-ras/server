/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as evt from "../events";

export const createTrackingEvents = () => {
  const seenEvents: AllEventsArray = [];
  const emitter: evt.ServerEventEmitter<any, any> = {
    emit: (eventName, args) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      seenEvents.push({ eventName: eventName as any, args: args as any }),
  };
  return {
    seenEvents,
    emitter,
  };
};

export type AllEventsArray = Array<
  KeysAndValuesAsUnion<evt.VirtualRequestProcessingEvents<any, any>>
>;

type KeysAndValuesAsUnion<T extends object> = {
  [P in keyof T]: { eventName: P; args: T[P] };
}[keyof T];
