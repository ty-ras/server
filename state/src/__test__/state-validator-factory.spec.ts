/**
 * @file This file contains unit tests for functionality in file `../state-validator-factory.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */

import test from "ava";
import * as spec from "../state-validator-factory";
import * as common from "./common";
import * as validation from "../validation";

test("Verify that state validator factory behaves as specified for authenticated properties", (c) => {
  c.plan(3);
  const stateValidatorFactory = createStateValidatorFactory(
    { userId: "userId" },
    {},
  );

  const mandatory = stateValidatorFactory({ userId: true });

  c.deepEqual(mandatory.stateInfo, ["userId"]);
  c.deepEqual(mandatory.validator({ userId: "userId" }), {
    error: "none",
    data: { userId: "userId" },
  });
  c.like(mandatory.validator({ userId: "not-user" }), {
    // protocol-error and 401, because authentication-related property
    error: "protocol-error",
    statusCode: 401,
    body: undefined,
  });
});

test("Verify that state validator factory behaves as specified for non-authenticated properties", (c) => {
  c.plan(3);
  const stateValidatorFactory = createStateValidatorFactory(
    {},
    { otherProperty: "otherProperty" },
  );

  const mandatory = stateValidatorFactory({ otherProperty: true });

  c.deepEqual(mandatory.stateInfo, ["otherProperty"]);
  c.deepEqual(mandatory.validator({ otherProperty: "otherProperty" }), {
    error: "none",
    data: { otherProperty: "otherProperty" },
  });
  c.like(mandatory.validator({ otherProperty: "not-otherProperty" }), {
    error: "error",
    errorInfo: {
      otherProperty: "not-otherProperty",
    },
  });
});

test("Verify that giving wrong input to state validator factory throws an error", (c) => {
  c.plan(2);

  const stateValidatorFactory = createStateValidatorFactory(
    { userId: "userId" },
    {},
  );

  c.throws(() => stateValidatorFactory({ notUserId: true } as any), {
    instanceOf: Error,
    message: 'The given key "notUserId" is not part of the state validation.',
  });
  c.throws(() => stateValidatorFactory({ userId: "somethingElse" } as any), {
    instanceOf: Error,
    message: 'The given key "userId" should contain boolean as value.',
  });
});

const createStateValidatorFactory = <
  TAuthenticated extends Record<string, unknown>,
  TOther extends Record<string, unknown>,
>(
  authenticated: TAuthenticated,
  other: TOther,
) =>
  spec.createStateValidatorFactoryGeneric<
    common.ValidatorHKT,
    validation.StatePropertyValidations<TAuthenticated, TOther>
  >(
    validation.getFullStateValidationInfo(authenticated, other),
    (mandatory) => {
      const validator = common.validatorForValue(
        Object.fromEntries(mandatory.map((v) => [v, v] as const)),
      );
      return (input) => {
        const result = validator(input);
        return result.error === "none"
          ? (result as any)
          : { ...result, erroneousProperties: ["userId"] };
      };
    },
  );
