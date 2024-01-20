/**
 * @file This file contains type definitions shared by other files in this directory.
 */

import type * as protocol from "@ty-ras/protocol";
import type * as md from "@ty-ras/metadata";

/**
 * This type defines the base constraint for generic type arguments accepting metadata provider dictionary.
 */
export type TMetadataProvidersBase = Record<string, md.MetadataProviderHKTBase>;

/**
 * This is base type for all TyRAS application builders' additional data specification [higher-kinded types (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again).
 * The point of HKT is that it can be used as generic argument without having generic arguments itself, e.g. something like using `function myFunc(list: List)` instead of `function <T>myFunc(list: List<T>)`.
 */
export interface EndpointSpecAdditionalDataHKTBase {
  /**
   * This property will be used as argument by both {@link MaterializeEndpointSpecAdditionalData} type.
   * It should never be overwritten by sub-types.
   */
  readonly _argProtocolSpec?: unknown;

  /**
   * This property will be used as argument by both {@link MaterializeEndpointSpecAdditionalData} type.
   * It should never be overwritten by sub-types.
   */
  readonly _argStateSpec?: unknown;

  /**
   * This property should contain the type expression for {@link MaterializeEndpointSpecAdditionalData} type.
   * It must always be overwritten by sub-types.
   */
  readonly _getAdditionalEndpointSpecData?: unknown;
}

/**
 * This is type which operates on subtypes of {@link EndpointSpecAdditionalDataHKTBase}, and is responsible for providing the actual generic type ("materializing") type with additional properties to specify when using application builder.
 */
export type MaterializeEndpointSpecAdditionalData<
  TAdditionalDataHKT extends EndpointSpecAdditionalDataHKTBase,
  TProtocolSpec extends protocol.ProtocolSpecCore<protocol.HttpMethod, unknown>,
  TStateSpec,
> = TAdditionalDataHKT extends {
  readonly _getAdditionalEndpointSpecData: unknown;
}
  ? (TAdditionalDataHKT & {
      readonly _argProtocolSpec: TProtocolSpec;
      readonly _argStateSpec: TStateSpec;
    })["_getAdditionalEndpointSpecData"]
  : never;

/**
 * This is single atom of {@link EndpointCreationArgLeaf} type.
 * It represents either class, or objects created from classes using `new` operator.
 * Since TypeScript does not allow easily to describe such nuances, it is for now just `object` type, to avoid at least the most obvious compilation errors.
 */
export type EndpointCreationArgLeafSingle = object;
