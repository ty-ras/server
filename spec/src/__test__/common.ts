/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
import * as rawBody from "raw-body";

export const outputSpec = <TValue>(
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
): data.DataValidator<data.HeaderValue | data.QueryValue, TValue> =>
  validatorFromValue<TValue, data.HeaderValue | data.QueryValue>(value);

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

export const getHumanReadableMessage = () => "";

export const CONTENT_TYPE = "string";
