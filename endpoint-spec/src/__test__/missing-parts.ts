/**
 * @file This file contains code and type definitions which 'fill in' the missing parts: easy-to-use builder factory, concrete HKTs and other things.
 */

import type * as protocol from "@ty-ras/protocol";
import * as dataBE from "@ty-ras/data-backend";
import * as data from "@ty-ras/data";
import * as spec from "..";
import * as util from "node:util";

/* eslint-disable
  @typescript-eslint/ban-types,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-unsafe-assignment,
  jsdoc/require-jsdoc
*/

/**
 * Creates new {@link spec.ApplicationBuilder}.
 * @param defaultReadRequestBody The default parameters for reading request bodies.
 * @returns A new {@link spec.ApplicationBuilder}.
 */
export function newBuilder(
  defaultReadRequestBody: dataBE.ReadBody,
): spec.ApplicationBuilder<
  EncodedHKT,
  ValidatorHKT,
  DefaultStateHKT,
  {},
  ServerContext,
  typeof CONTENT_TYPE,
  typeof CONTENT_TYPE,
  typeof CONTENT_TYPE,
  typeof CONTENT_TYPE,
  spec.NoAdditionalSpecDataHKT
> {
  return spec.newBuilderGeneric(
    CONTENT_TYPE,
    (decoder, opts) =>
      dataBE.requestBodyGeneric(
        decoder as any,
        opts?.contentType ?? CONTENT_TYPE,
        false,
        defaultReadRequestBody,
        validatorForValue(decoder),
        false,
      ),
    (stateSpec) => ({
      stateInfo: Object.keys(stateSpec) as any,
      validator: (data) => ({ error: "none", data: data as any }),
    }),
    {},
  );
}

export const validatorForValue =
  <T>(value: T): data.DataValidator<unknown, T> =>
  (data) =>
    util.isDeepStrictEqual(data, value)
      ? { error: "none", data: data as any }
      : { error: "error", errorInfo: data, getHumanReadableMessage };

export const getHumanReadableMessage = () => "";

export const urlParameter = <TName extends string, T>(
  name: TName,
  decoder: T,
  regExp?: RegExp,
) =>
  dataBE.urlParameterGeneric<TName, T, ValidatorHKT>(
    name,
    decoder,
    regExp ?? data.defaultParameterRegExp(),
    validatorForValue,
  );

export const query = <TQueryData extends protocol.TQueryDataBase>(
  validation: dataBE.QueryDataValidatorSpecMetadata<TQueryData, ValidatorHKT>,
) =>
  dataBE.stringDataValidatorDecoderGeneric<TQueryData, ValidatorHKT>(
    validation,
    validatorForValue,
    "Query parameter",
  );

export function responseBody<TOutput, TSerialized>(
  validation: Encoder<TOutput, TSerialized>,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  TSerialized,
  ValidatorHKT,
  typeof CONTENT_TYPE
>;
export function responseBody<TOutput, TSerialized, TContentType extends string>(
  validation: Encoder<TOutput, TSerialized>,
  contentType: TContentType,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  TSerialized,
  ValidatorHKT,
  TContentType
>;
export function responseBody<TOutput, TSerialized, TContentType extends string>(
  validation: Encoder<TOutput, TSerialized>,
  contentType?: TContentType,
): dataBE.DataValidatorResponseOutputSpec<
  TOutput,
  TSerialized,
  ValidatorHKT,
  TContentType
> {
  return dataBE.responseBodyGeneric<
    TOutput,
    TSerialized,
    TContentType,
    ValidatorHKT
  >(
    validation,
    contentType ?? (CONTENT_TYPE as any),
    validatorForValue(validation),
  );
}

export const responseHeaders = <
  THeaderData extends protocol.TRequestHeadersDataBase,
>(
  validation: dataBE.ResponseHeaderDataValidatorSpecMetadata<
    THeaderData,
    ValidatorHKT
  >,
) =>
  dataBE.stringDataValidatorEncoderGeneric<THeaderData, ValidatorHKT>(
    validation,
    validatorForValue,
    "Response header",
  );

export const CONTENT_TYPE = "text/plain";

const DEFAULT_AUTHENTICATED_STATE = Object.freeze({
  userId: "userId",
} as const);

const DEFAULT_NOT_AUTHENTICATED_STATE = Object.freeze({} as const);

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

export interface ServerContext {
  req: string;
  res: string;
}

export type DefaultStateHKT = StateHKT<
  StatePropertyValidations<
    typeof DEFAULT_AUTHENTICATED_STATE,
    typeof DEFAULT_NOT_AUTHENTICATED_STATE
  >
>;

export type AuthenticatedStateSpec = {
  [P in keyof typeof DEFAULT_AUTHENTICATED_STATE]: true;
};

export type StateHKT<TFullStateValidationInfo extends TStateValidationBase> =
  StateHKTGeneric<ValidatorHKT, TFullStateValidationInfo>;

export type DefaultStateInfo = dataBE.MaterializeStateInfo<
  DefaultStateHKT,
  dataBE.MaterializeStateSpecBase<DefaultStateHKT>
>;

export interface EncodedHKT extends protocol.EncodedHKTBase {
  /**
   * This property will be used to construct the final serialized ("encoded") type of some type defined in protocol specification.
   */
  readonly typeEncoded: this["_TEncodedSpec"];
}

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

export type TStateValidationBase = TStateValidationBaseGeneric<unknown>;
export type TStateValidationBaseGeneric<TDecoder> = Record<
  string,
  StatePropertyValidation<TDecoder, boolean>
>;

export interface StateHKTGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TFullStateValidationInfo extends TStateValidationBaseGeneric<
    data.MaterializeDecoder<TValidatorHKT, unknown>
  >,
> extends dataBE.StateHKTBase {
  _getState: GetStateGeneric<
    TValidatorHKT,
    TFullStateValidationInfo,
    this["_argStateSpec"]
  >;
  _getStateInfo: ReadonlyArray<keyof this["_argStateSpec"]>;
  _getStateSpecBase: StateSpec<TFullStateValidationInfo>;
}

export type GetStateGeneric<
  TValidatorHKT extends data.ValidatorHKTBase,
  TStateValidation extends TStateValidationBaseGeneric<
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

export type NonOptionalStateKeys<T> = {
  [P in keyof T]-?: false extends T[P] ? never : P;
}[keyof T];

export type StateSpec<
  TStateValidation extends TStateValidationBaseGeneric<unknown>,
> = Partial<{
  readonly [P in keyof TStateValidation]: StatePropertySpec;
}>;

export type StatePropertySpec = boolean;

export type ProtocolTypeOf<TValidation> = TValidation;

export type Decoder<TRuntime> = TRuntime;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Encoder<_TRuntime, TSerialized> = TSerialized;
