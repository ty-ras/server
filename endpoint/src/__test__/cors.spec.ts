/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test, { ExecutionContext } from "ava";
import * as data from "@ty-ras/data";
import * as spec from "../cors";
import type * as ep from "../endpoint";
import type * as methods from "../methods";

const testCORSedEP = async (
  t: ExecutionContext,
  method: methods.HttpMethod,
  allowHeaders: spec.CORSOptions["allowHeaders"],
) => {
  t.plan(7);
  const md = {};
  const corsOptions: spec.CORSOptions = {
    origin: "origin",
    allowHeaders,
  };
  const url = /url/;
  const response: ep.DynamicHandlerResponse<unknown> = {
    found: "handler",
    handler: {
      contextValidator: {
        validator: () => ({ error: "none", data: {} }),
        getState: () => undefined,
      },
      handler: () => ({
        error: "none",
        data: {
          contentType: "application/json",
          output: {},
        },
      }),
    },
  };
  const allowedMethods: Array<methods.HttpMethod> = ["GET"];
  const corsEP = spec.withCORSOptions(
    {
      getRegExpAndHandler: () => {
        return {
          url,
          handler: (method) =>
            method === "OPTIONS"
              ? {
                  found: "invalid-method",
                  allowedMethods,
                }
              : response,
        };
      },
      getMetadata: () => md,
    },
    corsOptions,
  );

  t.is(
    corsEP.getMetadata("ignored"),
    md,
    "CORSed EP must return same metadata",
  );
  const { url: seenURL, handler: seenHandler } =
    corsEP.getRegExpAndHandler("ignored");
  t.is(seenURL, url, "CORSed EP must return same URL");
  const handlerResponse = seenHandler(method, {});

  if (handlerResponse.found === "handler") {
    t.deepEqual(
      data.omit(handlerResponse.handler, "contextValidator", "handler"),
      {},
      "Returned handler must have only context and output callbacks.",
    );
    t.deepEqual(
      handlerResponse.handler.contextValidator.validator(undefined).error,
      "none",
      "CORSed EP must pass any context validation",
    );
    t.notThrows(
      () => handlerResponse.handler.contextValidator.getState(undefined),
      "CORSed EP must not throw on context state extraction",
    );
    const maybePromise = handlerResponse.handler.handler({} as any);
    t.assert(
      maybePromise instanceof Promise === (method !== "OPTIONS"),
      "CORSed EP must noet return async return value on OPTIONS.",
    );
    const awaited = await maybePromise;
    if (awaited.error === "none") {
      const expectedHeaders: Record<string, data.HeaderValue> = {
        "Access-Control-Allow-Origin": corsOptions.origin,
      };
      if (method === "OPTIONS") {
        expectedHeaders["Access-Control-Allow-Headers"] = Array.isArray(
          allowHeaders,
        )
          ? allowHeaders.join(",")
          : allowHeaders;
      }
      t.deepEqual(
        awaited.data.headers,
        expectedHeaders,
        "CORSed EP must return correct headers",
      );
    } else {
      t.fail("CORSed EP must not return error.");
    }
  } else {
    t.fail("CORSed EP must return handler for OPTIONS method");
  }
};

test(
  "Validate withCORSOptions works for OPTIONS",
  testCORSedEP,
  "OPTIONS",
  "allow-headers",
);
test(
  "Validate withCORSOptions works for GET",
  testCORSedEP,
  "GET",
  "allow-headers",
);
test(
  "Validate withCORSOptions works for GET and multiple headers",
  testCORSedEP,
  "GET",
  ["header1", "header2"],
);
