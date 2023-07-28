/**
 * @file This file contains tests for the endpoint builder using definitions in "./static.ts" file.
 */

import test from "ava";
import * as epValidation from "./endpoint-validation";
import staticClassEndpoints, { Endpoints } from "./static";

test("Test that decorator-based builder works on class with static methods", async (c) => {
  c.plan(5);
  const { endpoints } = staticClassEndpoints;
  c.deepEqual(
    endpoints.length,
    1,
    "There must be exactly one endpoint created by application builder.",
  );
  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => Endpoints.seenArgs,
  );
});
