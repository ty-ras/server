/**
 * @file This types-only file contains types used to obtain final shape of the state/context needed by BE endpoints.
 */

import type * as data from "../data";
import type * as dataBE from "../data-backend";
import type * as validation from "./validation";
import type * as spec from "./spec.types";

/**
 * Helper type to extract the final shape of the state/context, given the full state validation, and description of state/context needed by BE endpoint.
 * @see validation.TStateValidationBaseGeneric
 */
export type GetStateGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateValidation extends validation.TStateValidationBaseGeneric<
    data.MaterializeDecoder<TValidatorHKT, unknown>
  >,
  TStateSpec,
> = {
  [P in keyof TStateValidation &
    NonOptionalStateKeys<TStateSpec>]: data.MaterializeDecodedType<
    TValidatorHKT,
    TStateValidation[P]["validation"]
  >;
} & {
  [P in keyof TStateValidation &
    Exclude<
      keyof TStateSpec,
      NonOptionalStateKeys<TStateSpec>
    >]?: data.MaterializeDecodedType<
    TValidatorHKT,
    TStateValidation[P]["validation"]
  >;
};

/**
 * Helper type to extract the shape of the full state, given the full state validation.
 * @see validation.TStateValidationBaseGeneric
 */
export type GetFullStateGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateValidation extends validation.TStateValidationBaseGeneric<
    data.MaterializeDecoder<TValidatorHKT, unknown>
  >,
> = GetStateGeneric<
  TValidatorHKT,
  TStateValidation,
  { [P in keyof TStateValidation]: true }
>;

/**
 * Auxiliary type used by {@link GetState} to extract non-optional keys from given type.
 */
export type NonOptionalStateKeys<T> = {
  [P in keyof T]-?: false extends T[P] ? never : P;
}[keyof T];

export interface StateHKTGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TFullStateValidationInfo extends validation.TStateValidationBaseGeneric<
    data.MaterializeDecoder<TValidatorHKT, unknown>
  >,
> extends dataBE.StateHKTBase {
  _getState: GetStateGeneric<
    TValidatorHKT,
    TFullStateValidationInfo,
    this["_argStateValidationMetadata"]
  >;
  _getStateInfo: ReadonlyArray<keyof this["_argStateValidationMetadata"]>;
  _getStateSpecBase: spec.StateSpec<TFullStateValidationInfo>;
}
