/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import test from "ava";
import * as spec from "..";
import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";
import * as rawBody from "raw-body";

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
    const response = await handler(args);
    t.deepEqual(seenArgs, [data.omit(args, "url", "query", "headers", "body")]);
    t.deepEqual(response, {
      error: "none",
      data: {
        contentType: CONTENT_TYPE,
        output: responseBody,
      },
    });
  }
});

test("Validate that complex adhoc flow works", (t) => {
  t.plan(5);
  const responseBody = "ResponseBody";
  const initialState = "InitialState";
  const refinedState = "RefinedState";
  const seenArgs: Array<spec.EndpointHandlerArgs<unknown, string>> = [];
  const maybeHandler = spec
    .bindNecessaryTypes(() => initialState)
    .refineContext(
      {
        validator: validatorFromValue(undefined),
        getState: () => refinedState,
      },
      {},
    ).atURL`/path/${"urlParam"}`
    .validateURLData(
      stringDecoderSpec(
        {
          urlParam: "urlParamValue",
        },
        () => ({
          regExp: /.*/,
        }),
      ),
    )
    .forMethod("POST")
    .withBody(
      inputSpec(""),
      (args) => (seenArgs.push(args), responseBody),
      outputSpec(responseBody),
      {},
    )
    .createEndpoint({})
    .getRegExpAndHandler("")
    .handler("POST", {});
  if (maybeHandler.found === "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const { contextValidator, handler, ...rest } = maybeHandler.handler;
    t.deepEqual(contextValidator.validator(undefined).error, "none");
    t.deepEqual(contextValidator.getState(undefined), refinedState);
    t.deepEqual(rest, {});
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
          contentType: CONTENT_TYPE,
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

const inputSpec = <TValue>(
  value: TValue,
): dataBE.DataValidatorRequestInputSpec<TValue, { string: string }> => {
  return {
    validator: async ({ contentType, input }) => {
      const contents = await rawBody.default(input, "utf8");
      return contentType === CONTENT_TYPE
        ? contents === (value as any)
          ? { error: "none" as const, data: value }
          : {
              error: "error" as const,
              errorInfo: contents,
              getHumanReadableMessage,
            }
        : {
            error: "unsupported-content-type" as const,
            supportedContentTypes: [CONTENT_TYPE],
          };
    },
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
  <TValue, TInput = unknown>(
    value: TValue,
  ): data.DataValidator<TInput, TValue> =>
  (data) =>
    data === (value as any)
      ? { error: "none", data: data as unknown as TValue }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

const stringValidatorFromValue = <TValue>(
  value: TValue,
): data.DataValidator<data.HeaderValue | data.QueryValue, TValue> =>
  validatorFromValue<TValue, data.HeaderValue | data.QueryValue>(value);

const stringDecoderSpec = <
  TValue extends Record<string, unknown>,
  TAdditionalInfo extends Record<string, unknown>,
>(
  values: TValue,
  getAdditionalInfo: (
    value: TValue[keyof TValue],
    key: keyof TValue,
  ) => TAdditionalInfo,
): dataBE.StringDataValidatorSpec<
  TValue,
  { decoder: string },
  data.HeaderValue | data.QueryValue,
  TAdditionalInfo
> => {
  return {
    validators: data.transformEntries(values, (value) =>
      stringValidatorFromValue(value),
    ) as any,
    metadata: data.transformEntries(values, (value, key) => ({
      ...getAdditionalInfo(value, key),
      decoder: `${value}`,
    })),
  };
};

const getHumanReadableMessage = () => "";

const CONTENT_TYPE = "string";
