/**
 * @file This types-only file contains types used to obtain final shape of the state/context needed by BE endpoints.
 */

import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";
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

/**
 * This interface "implements" the generic [HKT](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again), {@link dataBE.StateHKTBase}, to set certain constraints, but still leave room for user  code to operate.
 *
 * The constraints that this HKT defines are the following:
 * - The _state type_ itself is an object, each property containing some specific aspect definable by user code,
 * - Each such property either is _authenticated_ or _not authenticated_ state.
 *     - Example of _authenticated_ state could be e.g. username extracted from JWT token.
 * - The _state specification type_ is an object, each property containing information about whether the target _state type object_ property is optional or required.
 * - The _state information type_ is an array of property names of _state specification object_.
 */
export interface StateHKTGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TFullStateValidationInfo extends validation.TStateValidationBaseGeneric<
    data.MaterializeDecoder<TValidatorHKT, unknown>
  >,
> extends dataBE.StateHKTBase {
  /**
   * This property "implements" the {@link dataBE.StateHKTBase._getState} property in order to provide functionality for {@link dataBE.MaterializeRuntimeState} type.
   * @see GetStateGeneric
   */
  _getState: GetStateGeneric<
    TValidatorHKT,
    TFullStateValidationInfo,
    this["_argStateSpec"]
  >;

  /**
   * This property "implements" the {@link dataBE.StateHKTBase._getStateInfo} property in order to provide functionality for {@link dataBE.MaterializeStateInfo} type.
   */
  _getStateInfo: ReadonlyArray<keyof this["_argStateSpec"]>;

  /**
   * This property "implements" the {@link dataBE.StateHKTBase._getStateSpecBase} property in order to provide functionality for {@link dataBE.MaterializeStateSpecBase} type.
   * @see spec.StateSpec
   */
  _getStateSpecBase: spec.StateSpec<TFullStateValidationInfo>;
}
