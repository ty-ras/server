import test from "ava";
import * as spec from "..";
import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";

// 'Adhoc' flow of using the library - as opposed to using batch specifications.

test("Validate that basic adhoc flow works", (t) => {
  t.plan(5);
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const maybeHandler = spec
    .bindNecessaryTypes(() => initialState)
    .atURL("url")
    .forMethod("GET")
    .withoutBody(
      (args) => (seenArgs.push(args), responseBody),
      outputSpec(responseBody),
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
    const response = handler(args);
    t.deepEqual(seenArgs, [args]);
    t.deepEqual(response, {});
  }
});

const outputSpec = <TValue>(
  value: TValue,
): dataBE.DataValidatorResponseOutputSpec<TValue, { string: string }> => {
  return {
    validator: data.transitiveDataValidation(
      stringifierValidator(value),
      (data) => ({
        error: "none",
        data: {
          contentType: "string",
          output: data,
        },
      }),
    ),
    validatorSpec: {
      contents: {
        string: `${value}`,
      },
    },
  };
};

const stringifierValidator =
  <TValue>(value: TValue): data.DataValidator<TValue, string> =>
  (data) =>
    data === value
      ? { error: "none", data: `${data}` }
      : { error: "error", errorInfo: data, getHumanReadableMessage };
const validatorFromValue =
  <TValue>(value: TValue): data.DataValidator<unknown, TValue> =>
  (data) =>
    data === value
      ? { error: "none", data: data as TValue }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

const getHumanReadableMessage = () => "";
