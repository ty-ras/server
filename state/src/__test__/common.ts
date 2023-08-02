/**
 * @file This file contains code shared by other test files.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import * as util from "node:util";

/* eslint-disable
  jsdoc/require-jsdoc,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-assignment
*/

/**
 * This is validator to be used only for tests.
 */
export interface ValidatorHKT extends data.ValidatorHKTBase {
  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getEncoder}.
   * For the test setup, it is simply encoded type itself.
   */
  readonly _getEncoder: this["_argEncodedType"];

  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getDecoder}.
   * For the test setup, it is simply decoded type itself.
   */
  readonly _getDecoder: this["_argDecodedType"];

  /**
   * This provides implementation for {@link data.ValidatorHKTBase._getDecodedType}.
   * For the test setup, it is simply decoder itself.
   */
  readonly _getDecodedType: this["_argDecoder"];
}

export interface EncodedHKT extends protocol.EncodedHKTBase {
  /**
   * This property will be used to construct the final serialized ("encoded") type of some type defined in protocol specification.
   */
  readonly typeEncoded: this["_TEncodedSpec"];
}

export const validatorForValue =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    util.isDeepStrictEqual(data, value)
      ? { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

export const getHumanReadableMessage = () => "";
