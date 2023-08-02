/**
 * @file This file contains the function to create necessary full state validation info from state validations for normal properties, and properties related to user authentication.
 */

import * as data from "@ty-ras/data";

/**
 * Constructs {@link StatePropertyValidation} objects from given native `io-ts` validators.
 * @param authenticated The validators for properties related to authenticated user (e.g. user ID, email, etc).
 * @param other The validators for properties related to internal things (e.g. DB connection pool, etc).
 * @returns The full state validation as an object with values being {@link StatePropertyValidation}, with given validators combined, and their {@link StatePropertyValidation#isAuthenticatedProperty} set appropriately.
 */
export const getFullStateValidationInfo = <
  TAuthenticated extends Record<string, unknown>,
  TOther extends Record<string, unknown>,
>(
  authenticated: TAuthenticated,
  other: TOther,
) =>
  ({
    ...data.transformEntries(other, (validation) => ({
      validation,
      isAuthenticationProperty: false,
    })),
    ...data.transformEntries(authenticated, (validation) => ({
      validation,
      isAuthenticationProperty: true,
    })),
  } as StatePropertyValidations<TAuthenticated, TOther>);

/**
 * This type contains information about all the validators of the state properties.
 * It is intersection of validators related to authentication, and validators related to other kind of properties.
 */
export type StatePropertyValidations<
  TAuthenticated extends Record<string, unknown>,
  TOther extends Record<string, unknown>,
> = {
  readonly [P in keyof TAuthenticated]: StatePropertyValidation<
    TAuthenticated[P],
    true
  >;
} & {
  readonly [P in keyof TOther]: StatePropertyValidation<TOther[P], false>;
};

/**
 * The base type for return value of {@link getFullStateValidationInfo}.
 */
export type TStateValidationBaseGeneric<TDecoder> = Record<
  string,
  StatePropertyValidation<TDecoder, boolean>
>;

/**
 * The type of values of object returned by {@link getFullStateValidationInfo}.
 */
export interface StatePropertyValidation<
  TDecoder,
  TIsAuthentication extends boolean,
> {
  /**
   * The native validator object (`io-ts`/`zod`/`runtypes`/etc).
   */
  validation: TDecoder;

  /**
   * Whether this state property is related to user authentication.
   * The TyRAS framework will use this information to create automatic error `401` for BE endpoints which require authenticated state/context properties, if they failed to be supplied (e.g. missing/malformed `Authorization` header from HTTP request).
   */
  isAuthenticationProperty: TIsAuthentication;
}
