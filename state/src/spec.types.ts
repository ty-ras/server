/**
 * @file This types-only file contains type definitions for specifying required state/context for an endpoint using object with each property expressing how the state element with the property name should be acquired (mandatory/optional, etc).
 */

import type * as validation from "./validation";

/**
 * This is type for object which define the state/context needed by BE endpoint.
 * Each property should describe whether the state/context element is required (`true`) or not (`false`).
 */
export type StateSpec<
  TStateValidation extends validation.TStateValidationBaseGeneric<unknown>,
> = Partial<{
  readonly [P in keyof TStateValidation]: StatePropertySpec;
}>;

/**
 * This type expresses information that {@link StateSpec} has about state properties.
 * For now, it is just a `boolean` indicating whether the target state property is required (`true`) or optional (`false`).
 */
export type StatePropertySpec = boolean;
