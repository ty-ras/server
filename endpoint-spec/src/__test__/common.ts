/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import type * as ep from "@ty-ras/endpoint";
import * as rawBody from "raw-body";
import * as spec from "..";

export const outputSpec = <TValue>(
  value: TValue,
  returnHeaders = false,
): dataBE.DataValidatorResponseOutputSpec<TValue, { string: string }> => {
  return {
    validator: data.transitiveDataValidation(
      stringifierValidator(value),
      (data) => {
        const retVal: data.DataValidatorResultSuccess<dataBE.DataValidatorResponseOutputSuccess> =
          {
            error: "none",
            data: {
              contentType: CONTENT_TYPE,
              output: data,
            },
          };
        if (returnHeaders) {
          retVal.data.headers = {
            responseHeaderName: "responseHeaderValue",
          };
        }
        return retVal;
      },
    ),
    validatorSpec: {
      contents: {
        string: `${value}`,
      },
    },
  };
};

export const inputSpec = <TValue>(
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

export const stringifierValidator =
  <TValue>(value: TValue): data.DataValidator<TValue, string> =>
  (data) =>
    data === value
      ? { error: "none", data: `${data}` }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

export const validatorFromValue =
  <TValue, TInput = unknown>(
    value: TValue,
  ): data.DataValidator<TInput, TValue> =>
  (data) =>
    data === (value as any)
      ? { error: "none", data: data as unknown as TValue }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

export const stringValidatorFromValue = <TValue>(
  value: TValue,
): data.DataValidator<data.ReadonlyStringValue, TValue> =>
  validatorFromValue<TValue, data.ReadonlyStringValue>(value);

export const stringDecoderSpec = <
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
  data.ReadonlyStringValue,
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

export const stringEncoderSpec = <
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
  { encoder: string },
  data.HeaderValue | data.QueryValue,
  TAdditionalInfo
> => {
  return {
    validators: data.transformEntries(values, (value) =>
      stringValidatorFromValue(value),
    ) as any,
    metadata: data.transformEntries(values, (value, key) => ({
      ...getAdditionalInfo(value, key),
      encoder: `${value}`,
    })),
  };
};

export const getHumanReadableMessage = () => "";

export const CONTENT_TYPE = "string";

export const INITIAL_STATE = "InitialState";

export const RESPONSE_BODY = "ResponseBody";

export const createSimpleEndpointHandler =
  <TRefinedContext, TState>(
    seenArgs: Array<spec.EndpointHandlerArgs<TRefinedContext, TState>>,
  ): spec.EndpointHandler<
    spec.EndpointHandlerArgs<TRefinedContext, TState>,
    string
  > =>
  (args) => (seenArgs.push(args), RESPONSE_BODY);

export const createComplexEndpointHandler = <TRefinedContext, TState>(
  seenArgs: Array<spec.EndpointHandlerArgs<TRefinedContext, TState>>,
): spec.EndpointHandlerSpec<
  spec.EndpointHandlerArgsWithURL<{
    urlParam: string;
  }> &
    spec.EndpointHandlerArgs<TRefinedContext, TState> &
    spec.EndpointHandlerArgsWithQuery<{}> &
    spec.EndpointHandlerArgsWithBody<{}>,
  string,
  {
    responseHeaderParam: string;
  },
  string
> => ({
  handler: (args) => (
    seenArgs.push(args),
    {
      body: RESPONSE_BODY,
      headers: {
        responseHeaderParam: "responseHeaderParamValue",
      },
    }
  ),
  headers: stringEncoderSpec(
    {
      responseHeaderParam: "responseHeaderParamValue",
    },
    () => ({ required: true }),
  ),
});

export const createStateValidator = <TState>(
  value: TState,
): ep.EndpointStateValidator<TState, TState> => ({
  stateInfo: value,
  validator: validatorFromValue(value),
});

export const STATE = "State";

export const state = createStateValidator<string>(STATE);

export const urlParam = <TName extends string, TValue extends string>(
  name: TName,
  value: TValue,
  regExp: RegExp,
): spec.URLParameterInfo<TName, TValue, TValue> => ({
  name,
  regExp,
  decoder: value,
  validator: validatorFromValue(value),
});
