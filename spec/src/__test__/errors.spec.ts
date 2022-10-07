/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "..";
import * as common from "./common";

test("Validate that can not re-specify existing method for same URL", (t) => {
  t.plan(1);
  t.throws(
    () =>
      spec.bindNecessaryTypes(getInitialState).atURL`/path`
        .batchSpec({
          method: "GET",
          endpointHandler: () => "",
          output: common.outputSpec(""),
          mdArgs: {},
        })
        .forMethod("GET" as any),
    {
      instanceOf: spec.InvalidMethodError,
    },
  );
});

test("Validate that response headers must be present in handler output if so specified in builder", async (t) => {
  t.plan(1);
  const maybeHandler = spec.bindNecessaryTypes(getInitialState).atURL`/path`
    .forMethod("GET")
    .withoutBody(
      {
        handler: () =>
          ({
            body: "",
          } as any),
        headers: common.stringEncoderSpec({}, () => ({ required: true })),
      },
      common.outputSpec(""),
      {},
    )
    .createEndpoint({})
    .getRegExpAndHandler("")
    .handler("GET", {});

  if (maybeHandler.found == "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const result = await maybeHandler.handler.handler({} as any);
    // Can't use deepEquals here because of getHumanReadableMessage being function
    t.like(result, {
      error: "error",
      errorInfo:
        "Internal error: response headers returned when no headers expected.",
    });
  }
});

test("Validate that erroneous endpoint handler response propagates to output", async (t) => {
  t.plan(1);
  const maybeHandler = spec.bindNecessaryTypes(getInitialState).atURL`/path`
    .batchSpec({
      method: "GET",
      endpointHandler: () => "",
      output: {
        validator: () => ({
          error: "error",
          errorInfo: "error",
          getHumanReadableMessage,
        }),
        validatorSpec: {
          contents: {
            string: "unused",
          },
        },
      },
      mdArgs: {},
    })
    .createEndpoint({})
    .getRegExpAndHandler("")
    .handler("GET", {});

  if (maybeHandler.found == "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const result = await maybeHandler.handler.handler({} as any);
    t.deepEqual(result, {
      error: "error",
      errorInfo: "error",
      getHumanReadableMessage,
    });
  }
});

test("Validate that building endpoint requires at least one method", (t) => {
  t.plan(1);
  t.throws(
    () =>
      new spec.AppEndpointBuilder({
        methods: {},
        contextTransform: {
          getState: () => "",
          validator: () => ({ error: "none", data: "" }),
        },
        fragments: [],
        metadata: {},
        urlValidation: undefined,
      }).createEndpoint({}),
    {
      instanceOf: spec.NoMethodsForEndpointError,
    },
  );
});

test("Validate that endpoint returns handlers only for methods that are specified in builder", (t) => {
  t.plan(1);
  t.deepEqual(
    spec.bindNecessaryTypes(getInitialState).atURL`/path`
      .batchSpec({
        method: "GET",
        endpointHandler: () => "",
        output: common.outputSpec(""),
        mdArgs: {},
      })
      .createEndpoint({})
      .getRegExpAndHandler("")
      .handler("POST", {}),
    { found: "invalid-method", allowedMethods: ["GET"] },
  );
});

const getInitialState = () => "";

const getHumanReadableMessage = () => "";
