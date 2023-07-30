/**
 * @file This file contains tests related to modularity enabled by structure of TyRAS builder.
 */

import test from "ava";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";
import * as epValidation from "./endpoint-validation";
import { app, Endpoints } from "./instance";

test("Verify that using different instances of same class behind different prefixes works", async (c) => {
  c.plan(3);

  const things = new Endpoints();
  const otherThings = new Endpoints();
  const { endpoints } = app.createEndpoints(
    {},
    { "/api": { "/things": things, "/otherThings": otherThings } },
  );

  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => things.seenArgs,
    "/api/things/something",
  );
  c.deepEqual(otherThings.seenArgs, []);

  await epValidation.validateEndpoint(
    c,
    endpoints[1],
    () => otherThings.seenArgs,
    "/api/otherThings/something",
  );
});
