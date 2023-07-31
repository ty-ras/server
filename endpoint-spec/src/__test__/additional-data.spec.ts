/**
 * @file This file contains tests related to specifying additional data to endpoint spec objects.
 */

import test from "ava";
import * as data from "@ty-ras/data";
import type * as spec from "..";
import * as mp from "./missing-parts";
import * as epValidation from "./endpoint-validation";
import * as protocol from "./protocol";

test("Verify that modifying additional endpoint spec data type works", async (c) => {
  c.plan(14);

  // Create app and tracking array
  const { app, permissionChecks } = newBuilder();
  type StateSpecBase = spec.StateSpecBaseOfAppBuilder<typeof app>;

  // Create endpoints
  const url = app.url`/${mp.urlParameter("urlParam", protocol.urlParam)}`({});
  const authState = {
    userId: true,
  } as const satisfies StateSpecBase;
  const unauthState = {
    userId: false,
  } as const satisfies StateSpecBase;

  class Endpoints {
    public readonly seenArgs: Array<unknown> = [];

    @url<Endpoint1>({})({
      method: "GET",
      state: authState,
      responseBody: mp.responseBody("simpleResponseBody"),
      permissions: "permissions",
    })
    authenticatedEndpoint(
      args: spec.GetMethodArgs<Endpoint1, typeof url, typeof authState>,
    ) {
      this.seenArgs.push(args);
      return "simpleResponseBody" as const;
    }

    @url<Endpoint2>({})({
      method: "POST",
      state: unauthState,
      responseBody: mp.responseBody("simpleResponseBody"),
    })
    unauthenticatedEndpoint(
      args: spec.GetMethodArgs<Endpoint2, typeof url, typeof unauthState>,
    ) {
      this.seenArgs.push(args);
      return "simpleResponseBody" as const;
    }
  }

  const instance = new Endpoints();
  const { endpoints } = app.createEndpoints({}, instance);

  // Initial asserts
  c.deepEqual(endpoints.length, 1);
  c.deepEqual(permissionChecks, []);

  // Check endpoint with permissions
  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => instance.seenArgs,
    // No additional prefix is needed
    "",
    // Remove body, query, and state from inputs as they are unused by this endpoint
    (info) => {
      const result = info.splice(3);
      result.unshift(["stateInformation.stateInfo.0", "userId"]);
      return result;
    },
    // Expected output is also different
    {
      contentType: "text/plain",
      output: '"simpleResponseBody"',
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    (args) => data.omit(args, "body", "query") as any,
  );
  c.deepEqual(permissionChecks, ["permissions"]);

  // Check endpoint without permissions
  permissionChecks.length = 0;
  instance.seenArgs.length = 0;
  await epValidation.validateEndpoint(
    c,
    endpoints[0],
    () => instance.seenArgs,
    // No additional prefix is needed
    "",
    // Remove body, query, and state from inputs as they are unused by this endpoint
    (info) => {
      const result = info.splice(3);
      result.unshift(["stateInformation.stateInfo.0", "userId"]);
      return result;
    },
    // Expected output is also different
    {
      contentType: "text/plain",
      output: '"simpleResponseBody"',
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    (args) => data.omit(args, "body", "query") as any,
    // Now invoke the unauthenticatedEndpoint() method by using POST
    "POST",
  );
  c.deepEqual(permissionChecks, []);
});

/**
 * This [higher-kinded types (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) interface simulates real-life situation, where endpoints which require authentication (their state spec contains "userId" property), also must specify the permissions that the operation requires.
 * In this test setup, the permission type is simply "string", but in reality, it can be something more complex and domain-specific.
 */
interface PermissionAdditionalDataHKT
  extends spec.EndpointSpecAdditionalDataHKTBase {
  readonly _getAdditionalEndpointSpecData: this["_argStateSpec"] extends mp.AuthenticatedStateSpec
    ? { permissions: string }
    : { permissions?: never };
}

const newBuilder = () => {
  const permissionChecks: Array<string> = [];
  const app = mp
    .newBuilder({})
    .changeEndpointSpecAdditionalData<PermissionAdditionalDataHKT>(
      ({ boundMethod, spec: { state, permissions } }) => {
        if (state.userId === true) {
          if (typeof permissions !== "string") {
            throw new Error(
              "If endpoint requires authentication, the permissions must be specified!",
            );
          }
          return (args) => {
            // Simulate doing permission checks
            permissionChecks.push(permissions);

            // If successful -> invoke original method
            return boundMethod(args);
          };
        }
      },
    );
  return { app, permissionChecks };
};

type Endpoint1 = protocol.SimpleEndpoint & { url: { urlParam: "urlParam" } };
type Endpoint2 = protocol.SimpleEndpoint2 & { url: { urlParam: "urlParam" } };
