/**
 * @file This types-only file specifies type definitions for specifying state as array of property names of full state specification.
 */

/**
 * State info is what is being passed as argument to callback which is responsible of producing state object during HTTP request handling by TyRAS server.
 */
export type StateInfo<TState> = StateInfoOfKeys<keyof TState>;
/**
 * State info is what is being passed as argument to callback which is responsible of producing state object during HTTP request handling by TyRAS server.
 */
export type StateInfoOfKeys<TKeys extends PropertyKey> = ReadonlyArray<TKeys>;
/**
 * Base type for other types which use {@link StateInfoOfKeys} as their generic argument.
 */
export type TStateInfoOfKeysBase = StateInfoOfKeys<PropertyKey>;
