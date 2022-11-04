/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
import test, { ExecutionContext } from "ava";
import * as spec from "..";
import * as common from "./common";
import * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";

const testWithSimpleEndpoint = async (
  t: ExecutionContext,
  useBatch: boolean,
) => {
  t.plan(5);
  const responseBody = common.RESPONSE_BODY;
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, unknown>> = [];
  const endpointHandler = common.createSimpleEndpointHandler(seenArgs);
  const starter = spec.startBuildingAPI().atURL`/path`;
  const maybeHandler = (
    useBatch
      ? starter.batchSpec({
          state: common.state,
          method: "GET",
          endpointHandler,
          output: common.outputSpec(responseBody),
          mdArgs: {},
        })
      : starter
          .forMethod("GET", common.state)
          .withoutBody(endpointHandler, common.outputSpec(responseBody), {})
  )
    .createEndpoint({})
    .endpoint.getRegExpAndHandler("")
    .handler("GET", {});
  if (maybeHandler.found === "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const { stateValidator, handler, ...rest } = maybeHandler.handler;
    t.deepEqual(stateValidator.validator(common.STATE).error, "none");
    t.deepEqual(stateValidator.stateInfo, common.STATE);
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
};

const testWithComplexEndpoint = async (
  t: ExecutionContext,
  useBatch: boolean,
) => {
  t.plan(10);
  const responseBody = common.RESPONSE_BODY;
  const refinedState = "RefinedState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const endpointHandler = common.createComplexEndpointHandler(seenArgs);
  const starter = spec.startBuildingAPI().atURL`/path/${common.urlParam(
    "urlParam",
    "urlParamValue",
    /.*/,
  )}`;
  const query = common.stringDecoderSpec(
    {
      queryParam: "queryParamValue",
    },
    () => ({ required: true }),
  );
  const headers = common.stringDecoderSpec(
    {
      headerParam: "headerParamValue",
    },
    () => ({ required: true }),
  );
  const maybeHandler = (
    useBatch
      ? starter.batchSpec({
          state: common.createStateValidator(refinedState),
          method: "POST",
          endpointHandler: endpointHandler.handler,
          query,
          headers,
          input: common.inputSpec(""),
          responseHeaders: endpointHandler.headers,
          output: common.outputSpec(responseBody, true),
          mdArgs: {},
        })
      : starter
          .forMethod(
            "POST",
            common.createStateValidator(refinedState),
            query,
            headers,
          )
          .withBody(
            common.inputSpec(""),
            endpointHandler,
            common.outputSpec(responseBody, true),
            {},
          )
  )
    .createEndpoint({})
    .endpoint.getRegExpAndHandler("")
    .handler("POST", {});
  if (maybeHandler.found === "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const {
      stateValidator,
      handler,
      urlValidator,
      queryValidator,
      headerValidator,
      bodyValidator,
      ...rest
    } = maybeHandler.handler;
    t.deepEqual(stateValidator.validator(refinedState).error, "none");
    t.deepEqual(stateValidator.stateInfo, refinedState);
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
        headers: {
          responseHeaderParam: "responseHeaderParamValue",
        },
      },
    });
  }
};

test("Validate that simple adhoc flow works", testWithSimpleEndpoint, false);
test("Validate that simple batch flow works", testWithSimpleEndpoint, true);

test("Validate that complex adhoc flow works", testWithComplexEndpoint, false);
test("Validate that complex batch flow works", testWithComplexEndpoint, true);
