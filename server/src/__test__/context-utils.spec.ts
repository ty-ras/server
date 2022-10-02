/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "../context-utils";
import type * as ctx from "../context";
import type * as data from "@ty-ras/data";

test("Validate validateContextState works", (t) => {
  t.plan(2);
  const { validator, getState } =
    spec.createContextValidatorFactory<HKTContext>(getContextState)((data) => ({
      error: "none",
      data,
    }));
  t.deepEqual(validator(dummyContext), {
    error: "none",
    data: dummyContext,
  });
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

test("Validate validateContextState works with failing callback", (t) => {
  t.plan(2);
  const { validator, getState } =
    spec.createContextValidatorFactory<HKTContext>(getContextState)(
      erroringValidator,
    );
  t.deepEqual(validator(dummyContext), errorObject);
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

test("Validate validateContextState works with failing callback and custom status code", (t) => {
  t.plan(2);
  const { validator, getState } =
    spec.createContextValidatorFactory<HKTContext>(getContextState)(
      erroringValidator,
      403,
    );
  t.deepEqual(validator(dummyContext), {
    error: "protocol-error",
    statusCode: 403,
    body: undefined,
  });
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

test("Validate validateContextState works with failing callback and custom status code and body", (t) => {
  t.plan(2);
  const { validator, getState } =
    spec.createContextValidatorFactory<HKTContext>(getContextState)(
      erroringValidator,
      {
        statusCode: 403,
        body: "Body",
      },
    );
  t.deepEqual(validator(dummyContext), {
    error: "protocol-error",
    statusCode: 403,
    body: "Body",
  });
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

const getHumanReadableMessage = () => "";

const erroringValidator: data.DataValidator<State, unknown> = () => errorObject;

const errorObject: data.DataValidatorResultError = {
  error: "error",
  errorInfo: "Info",
  getHumanReadableMessage,
};

interface HKTContext extends ctx.HKTContext {
  type: Context<this["_TState"]>;
}

interface Context<TState> {
  req: string;
  res: string;
  state: TState;
}

const dummyContext: Context<State> = {
  req: "Request",
  res: "Result",
  state: {
    property: "State",
  },
};

interface State {
  property: string;
}

const getContextState = <TState>(ctx: Context<TState>) => ctx.state;
