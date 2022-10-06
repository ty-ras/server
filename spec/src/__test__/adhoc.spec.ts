import test from "ava";
import * as spec from "..";
import * as common from "./common";
import * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";

// 'Adhoc' flow of using the library - as opposed to using batch specifications.

test("Validate that basic adhoc flow works", async (t) => {
  t.plan(5);
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const maybeHandler = spec.bindNecessaryTypes(() => initialState).atURL`/path`
    .forMethod("GET")
    .withoutBody(
      (args) => (seenArgs.push(args), responseBody),
      common.outputSpec(responseBody),
      {},
    )
    .createEndpoint({})
    .getRegExpAndHandler("")
    .handler("GET", {});
  if (maybeHandler.found === "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const { contextValidator, handler, ...rest } = maybeHandler.handler;
    t.deepEqual(contextValidator.validator(undefined).error, "none");
    t.deepEqual(contextValidator.getState(undefined), initialState);
    t.deepEqual(rest, {});
    const args: Parameters<ep.StaticAppEndpointHandlerFunction<unknown>>[0] = {
      context: undefined,
      state: initialState,
      url: undefined,
      query: undefined,
      headers: {},
      body: undefined,
    };
    const response = await handler({ ...args }); // Copy to avoid accidental modifications by testable code
    t.deepEqual(seenArgs, [data.omit(args, "url", "query", "headers", "body")]);
    t.deepEqual(response, {
      error: "none",
      data: {
        contentType: common.CONTENT_TYPE,
        output: responseBody,
      },
    });
  }
});

test("Validate that complex adhoc flow works", async (t) => {
  t.plan(10);
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const refinedState = "RefinedState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const maybeHandler = spec
    .bindNecessaryTypes(() => initialState)
    .refineContext(
      {
        validator: common.validatorFromValue(undefined),
        getState: () => refinedState,
      },
      {},
    ).atURL`/path/${"urlParam"}`
    .validateURLData(
      common.stringDecoderSpec(
        {
          urlParam: "urlParamValue",
        },
        () => ({
          regExp: /.*/,
        }),
      ),
    )
    .forMethod(
      "POST",
      common.stringDecoderSpec(
        {
          queryParam: "queryParamValue",
        },
        () => ({ required: true }),
      ),
      common.stringDecoderSpec(
        {
          headerParam: "headerParamValue",
        },
        () => ({ required: true }),
      ),
    )
    .withBody(
      common.inputSpec(""),
      (args) => (seenArgs.push(args), responseBody),
      common.outputSpec(responseBody),
      {},
    )
    .createEndpoint({})
    .getRegExpAndHandler("")
    .handler("POST", {});
  if (maybeHandler.found === "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const {
      contextValidator,
      handler,
      urlValidator,
      queryValidator,
      headerValidator,
      bodyValidator,
      ...rest
    } = maybeHandler.handler;
    t.deepEqual(contextValidator.validator(undefined).error, "none");
    t.deepEqual(contextValidator.getState(undefined), refinedState);
    t.deepEqual(urlValidator?.groupNames, {
      urlParam: "urlParam",
    });
    // I wish there would be some kind of 'isFunction' or 'isTypeOf(arg, argTypeString)' in ExecutionContext.
    t.deepEqual(urlValidator?.validators, {
      urlParam: urlValidator?.validators?.urlParam,
    });
    t.deepEqual(queryValidator, {
      queryParam: queryValidator?.queryParam,
    });
    t.deepEqual(headerValidator, {
      headerParam: headerValidator?.headerParam,
    });
    t.true(typeof bodyValidator === "function");
    t.deepEqual(rest, {});
    const args: Parameters<ep.StaticAppEndpointHandlerFunction<unknown>>[0] = {
      context: undefined,
      state: refinedState,
      url: undefined,
      query: undefined,
      headers: {},
      body: undefined,
    };
    const response = await handler({ ...args }); // Copy to avoid accidental modifications by testable code
    t.deepEqual(seenArgs, [args]);
    t.deepEqual(response, {
      error: "none",
      data: {
        contentType: common.CONTENT_TYPE,
        output: responseBody,
      },
    });
  }
});
