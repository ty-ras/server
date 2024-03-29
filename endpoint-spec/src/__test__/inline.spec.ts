/**
 * @file This file contains tests for the endpoint builder using definitions in "./inline.ts" file.
 */

import test from "ava";
import * as epValidation from "./endpoint-validation";
import inlineEndpoints, { SEEN_ARGS, endpoint, implementation } from "./inline";

test("Test that decorator-based builder works on class with instance methods", async (c) => {
  c.plan(7);
  const { endpoints } = inlineEndpoints;
  c.deepEqual(
    endpoints.length,
    1,
    "There must be exactly one endpoint created by application builder.",
  );
  c.true(endpoint.implementation === implementation);
  await epValidation.validateEndpoint(c, endpoints[0], () => SEEN_ARGS);
});
