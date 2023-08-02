/**
 * @file This file contains function to create callback which takes description about needed BE endpoint state/context, and produces {@link ep.EndpointStateInformation} which will be then used by TyRAS framework to perform the state/context extraction and validation process, before passing it to BE endpoint.
 */

import * as data from "@ty-ras/data";
import type * as ep from "@ty-ras/endpoint";
import type * as validation from "./validation";
import type * as state from "./state.types";
import type * as stateInfo from "./state-info.types";
import type * as spec from "./spec.types";

/**
 * Creates {@link CreateStateValidatorFactory} which can be used to create {@link ep.EndpointStateInformation} objects from given BE endpoint state/context description.
 * @param validation The object, keys being state/context names, and values being {@link validation.StatePropertyValidation}.
 * @param makeValidator The callback to create validator from mandatory and optional validators. The returned validator should in case of error produce {@link data.DataValidatorResponseOutputError} with extra property containing information about which properties have failed validation.
 * @returns The {@link CreateStateValidatorFactory} which can be used to create {@link ep.EndpointStateInformation} objects from given BE endpoint state/context description.
 */
export const createStateValidatorFactoryGeneric =
  <
    TValidatorHKT extends data.ValidatorHKTBase,
    TStateValidation extends validation.TStateValidationBaseGeneric<
      data.MaterializeDecoder<TValidatorHKT, unknown>
    >,
  >(
    validation: TStateValidation,
    makeValidator: <TStateSpec extends spec.StateSpec<TStateValidation>>(
      mandatory: Array<keyof TStateValidation>,
      optional: Array<keyof TStateValidation>,
    ) => data.DataValidator<
      unknown,
      state.GetStateGeneric<TValidatorHKT, TStateValidation, TStateSpec>,
      data.DataValidatorResultError & {
        erroneousProperties: ReadonlyArray<string>;
      }
    >,
  ): CreateStateInformationFactoryGeneric<TValidatorHKT, TStateValidation> =>
  (specObject) => {
    const ensureSpecKey = (key: string) => {
      const maybeValidator = validation[key];
      if (!maybeValidator) {
        throw new Error(
          `The given key "${key}" is not part of the state validation.`,
        );
      }
      const specObjectValue = specObject[key];
      if (typeof specObjectValue !== "boolean") {
        throw new Error(
          `The given key "${key}" should contain boolean as value.`,
        );
      }
      return specObjectValue;
    };
    const keys = Object.keys(specObject);
    const validator = makeValidator<typeof specObject>(
      keys.filter((key) => ensureSpecKey(key) === true),
      keys.filter((key) => ensureSpecKey(key) === false),
    );
    return {
      stateInfo: keys,
      validator: (input) => {
        const validationResult = validator(input);
        if (validationResult.error === data.DATA_VALIDATION_RESULT_KIND_ERROR) {
          const { erroneousProperties, ...normalErrorResult } =
            validationResult;
          return erroneousProperties.some(
            (propName) =>
              validation[propName]?.isAuthenticationProperty ?? false,
          )
            ? {
                error: "protocol-error",
                statusCode: 401, // 401 is "no authentication", while 403 is "no permission even with authentication"
                body: undefined,
              }
            : normalErrorResult;
        }
        return validationResult;
      },
    };
  };

/**
 * This is the return type of {@link createStateValidatorFactory}, describing the callback used to produce {@link ep.EndpointStateInformation} objects from given description of state/context needed by BE endpoint.
 */
export type CreateStateInformationFactoryGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateValidation extends validation.TStateValidationBaseGeneric<
    data.MaterializeDecoder<TValidatorHKT, unknown>
  >,
> = <TStateSpec extends spec.StateSpec<TStateValidation>>(
  spec: TStateSpec,
) => ep.EndpointStateInformation<
  stateInfo.StateInfoOfKeys<keyof TStateSpec>,
  state.GetStateGeneric<TValidatorHKT, TStateValidation, TStateSpec>
>;
