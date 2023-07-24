import test from "ava";
import * as start from "../start";
import * as protocol from "./protocol";
import * as dataIO from "../../data-backend-io-ts";

test("Verify that using same protocol interface twice in a single class produces meaningful error", (c) => {
  c.plan(1);
  const app = start.newBuilder({}).resetMetadataProviders();
  const url = app.url`/api/endpoint`({});

  c.throws(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Class {
        @url<protocol.SimpleEndpoint>({})({
          method: "GET",
          responseBody: dataIO.responseBody(protocol.simpleResponseBody),
          state: {},
        })
        endpoint() {
          return "";
        }

        @url<protocol.SimpleEndpoint>({})({
          method: "GET",
          responseBody: dataIO.responseBody(protocol.simpleResponseBody),
          state: {},
        })
        endpoint2() {
          return "";
        }
      }
    },
    {
      instanceOf: Error,
      message: 'Can not define different endpoints fot same method "GET".',
    },
  );
});

test("Verify that using decorators on instance methods but passing class to endpoint builder produces meaningful error", (c) => {
  c.plan(1);
  const app = start.newBuilder({}).resetMetadataProviders();
  const url = app.url`/api/endpoint`({});
  class Class {
    @url<protocol.SimpleEndpoint>({})({
      method: "GET",
      responseBody: dataIO.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "";
    }
  }

  c.throws(
    () => {
      app.createEndpoints({}, Class);
    },
    {
      instanceOf: Error,
      message:
        "The given class or instance was not augmented at all, or was instance of class with static methods, or was augmented with decorators from another application.",
    },
  );
});
