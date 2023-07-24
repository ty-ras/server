import test from "ava";
import * as epValidation from "./endpoint-validation";
import * as mdValidation from "./md-validation";
import staticClassEndpoints from "./static";

test("Test that decorator-based builder works on class with static methods", async (c) => {
  c.plan(6);
  const {
    endpoints,
    metadata: { openapi: openAPIDocument },
  } = staticClassEndpoints;
  c.deepEqual(
    endpoints.length,
    1,
    "There must be exactly one endpoint created by application builder.",
  );
  await epValidation.validateEndpoint(c, endpoints[0], undefined);
  mdValidation.validateMetadata(c, openAPIDocument);
});
