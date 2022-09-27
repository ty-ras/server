import type * as data from "@ty-ras/data";
import type * as dataBE from "@ty-ras/data-backend";

// Higher-kinded-type trick from: https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again
export interface HKTContext {
  readonly _TState?: unknown;
  readonly type?: unknown;
}

export type HKTContextKind<F extends HKTContext, TState> = F extends {
  readonly type: unknown;
}
  ? (F & {
      readonly _TState: TState;
    })["type"]
  : never; // This is simplified version from original HKT pattern in the link, because we don't use the functional properties of this specific HKT.

export type ContextValidatorFactory<TContext extends HKTContext> = <
  TInput,
  TData,
>(
  validator: data.DataValidator<TInput, TData>,
  protocolErrorInfo?:
    | number
    | {
        statusCode: number;
        body: string | undefined;
      },
) => dataBE.ContextValidatorSpec<
  HKTContextKind<TContext, TInput>,
  HKTContextKind<TContext, TData>,
  TData
>;

export type GetStateFromContext<TContext extends HKTContext> = <TState>(
  context: HKTContextKind<TContext, TState>,
) => TState;

export type DataValidatorOutput<T> = data.DataValidatorOutput<T>;
