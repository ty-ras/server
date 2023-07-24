import test from "ava";
import * as epValidation from "./endpoint-validation";
import * as mdValidation from "./md-validation";
import instanceClassEndpoints, { INSTANCE_DATA } from "./instance";

test("Test that decorator-based builder works on class with instance methods", async (c) => {
  c.plan(6);
  const {
    endpoints,
    metadata: { openapi: openAPIDocument },
  } = instanceClassEndpoints;
  c.deepEqual(
    endpoints.length,
    1,
    "There must be exactly one endpoint created by application builder.",
  );
  await epValidation.validateEndpoint(c, endpoints[0], INSTANCE_DATA);
  mdValidation.validateMetadata(c, openAPIDocument);
});
