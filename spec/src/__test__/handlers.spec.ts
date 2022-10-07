/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
import test, { ExecutionContext } from "ava";
import * as spec from "..";
import * as common from "./common";
import * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";

// 'Adhoc' flow of using the library - as opposed to typical flow which uses batch specifications.

const testWithSimpleEndpoint = async (
  t: ExecutionContext,
  useBatch: boolean,
) => {
  t.plan(5);
  const responseBody = common.RESPONSE_BODY;
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const endpointHandler = common.createSimpleEndpointHandler(seenArgs);
  const starter = spec.bindNecessaryTypes(() => initialState).atURL`/path`;
  const maybeHandler = (
    useBatch
      ? starter.batchSpec({
          method: "GET",
          endpointHandler,
          output: common.outputSpec(responseBody),
          mdArgs: {},
        })
      : starter
          .forMethod("GET")
          .withoutBody(endpointHandler, common.outputSpec(responseBody), {})
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
};

const testWithComplexEndpoint = async (
  t: ExecutionContext,
  useBatch: boolean,
) => {
  t.plan(10);
  const responseBody = common.RESPONSE_BODY;
  const initialState = "InitialState";
  const refinedState = "RefinedState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const endpointHandler = common.createComplexEndpointHandler(seenArgs);
  const starter = spec
    .bindNecessaryTypes(() => initialState)
    .refineContext(
      {
        validator: common.validatorFromValue(undefined),
        getState: () => refinedState,
      },
      {},
    ).atURL`/path/${"urlParam"}`.validateURLData(
    common.stringDecoderSpec(
      {
        urlParam: "urlParamValue",
      },
      () => ({
        regExp: /.*/,
      }),
    ),
  );
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
          .forMethod("POST", query, headers)
          .withBody(
            common.inputSpec(""),
            endpointHandler,
            common.outputSpec(responseBody, true),
            {},
          )
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
        headers: {
          responseHeaderParam: "responseHeaderParamValue",
        },
      },
    });
  }
};

test(
  "Handlers: Validate that simple adhoc flow works",
  testWithSimpleEndpoint,
  false,
);
test(
  "Handlers: Validate that simple batch flow works",
  testWithSimpleEndpoint,
  true,
);

test(
  "Handlers: Validate that complex adhoc flow works",
  testWithComplexEndpoint,
  false,
);
test(
  "Handlers: Validate that complex batch flow works",
  testWithComplexEndpoint,
  true,
);

test("Handlers: Validate all batch spec combinations", (t) => {
  t.plan(1);
  spec.bindNecessaryTypes(() => "").atURL`/path`
    .batchSpec({
      method: "POST",
      endpointHandler: () => "",
      output: common.outputSpec(""),
      input: common.inputSpec(""),
      mdArgs: {},
    })
    .batchSpec({
      method: "GET",
      endpointHandler: () => "",
      output: common.outputSpec(""),
      headers: common.stringEncoderSpec({}, () => ({ required: true })),
      mdArgs: {},
    })
    .batchSpec({
      method: "DELETE",
      endpointHandler: () => ({
        body: "",
        headers: {},
      }),
      output: common.outputSpec(""),
      responseHeaders: common.stringEncoderSpec({}, () => ({ required: true })),
      mdArgs: {},
    });
  t.pass(
    "This only exists to make sure typical usecases compile successfully.",
  );
});
