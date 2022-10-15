/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "..";
import * as common from "./common";

test("Validate that can not re-specify existing method for same URL", (t) => {
  t.plan(1);
  t.throws(
    () =>
      spec.startBuildingAPI().atURL`/path`
        .batchSpec({
          state: common.state,
          method: "GET",
          endpointHandler: () => "",
          output: common.outputSpec(""),
          mdArgs: {},
        })
        .forMethod("GET" as any, undefined as any),
    {
      instanceOf: spec.InvalidMethodError,
    },
  );
});

test("Validate that response headers must be present in handler output if so specified in builder", async (t) => {
  t.plan(1);
  const maybeHandler = spec.startBuildingAPI().atURL`/path`
    .forMethod("GET", common.state)
    .withoutBody(
      {
        handler: () =>
          ({
            body: "",
          } as any),
        headers: common.stringEncoderSpec({}, () => ({ required: true })),
      },
      common.outputSpec(""),
      {},
    )
    .createEndpoint({})
    .endpoint.getRegExpAndHandler("")
    .handler("GET", {});

  if (maybeHandler.found == "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const result = await maybeHandler.handler.handler({} as any);
    // Can't use deepEquals here because of getHumanReadableMessage being function
    t.like(result, {
      error: "error",
      errorInfo:
        "Internal error: response headers returned when no headers expected.",
    });
  }
});

test("Validate that erroneous endpoint handler response propagates to output", async (t) => {
  t.plan(1);
  const maybeHandler = spec.startBuildingAPI().atURL`/path`
    .batchSpec({
      state: common.state,
      method: "GET",
      endpointHandler: () => "",
      output: {
        validator: () => ({
          error: "error",
          errorInfo: "error",
          getHumanReadableMessage,
        }),
        validatorSpec: {
          contents: {
            string: "unused",
          },
        },
      },
      mdArgs: {},
    })
    .createEndpoint({})
    .endpoint.getRegExpAndHandler("")
    .handler("GET", {});

  if (maybeHandler.found == "handler") {
    // If it isn't, we will get different number of assertions than planned, and test will fail
    const result = await maybeHandler.handler.handler({} as any);
    t.deepEqual(result, {
      error: "error",
      errorInfo: "error",
      getHumanReadableMessage,
    });
  }
});

test("Validate that building endpoint requires at least one method", (t) => {
  t.plan(1);
  t.throws(
    () =>
      new spec.AppEndpointBuilder({
        methods: {},
        fragments: [],
        metadata: {},
        urlValidation: undefined,
      }).createEndpoint({}),
    {
      instanceOf: spec.NoMethodsForEndpointError,
    },
  );
});

test("Validate that endpoint returns handlers only for methods that are specified in builder", (t) => {
  t.plan(1);
  t.deepEqual(
    spec.startBuildingAPI().atURL`/path`
      .batchSpec({
        state: common.state,
        method: "GET",
        endpointHandler: () => "",
        output: common.outputSpec(""),
        mdArgs: {},
      })
      .createEndpoint({})
      .endpoint.getRegExpAndHandler("")
      .handler("POST", {}),
    { found: "invalid-method", allowedMethods: ["GET"] },
  );
});

test("Validate that if response headers validation doesn't pass, the whole output is considered failed", async (t) => {
  t.plan(1);
  const maybeHandler = spec.startBuildingAPI().atURL`/path`
    .batchSpec({
      state: common.state,
      method: "GET",
      endpointHandler: () => ({
        body: "",
        headers: {},
      }),
      responseHeaders: common.stringEncoderSpec(
        { responseHeaderParam: "responseHeaderParamValue" },
        () => ({ required: true }),
      ),
      output: common.outputSpec(""),
      mdArgs: {},
    })
    .createEndpoint({})
    .endpoint.getRegExpAndHandler("")
    .handler("GET", {});
  if (maybeHandler.found === "handler") {
    // .like because can't customize function comparison
    t.like(
      await maybeHandler.handler.handler({
        context: "",
        state: "",
        url: "",
        query: {},
        body: "",
        headers: {},
      }),
      {
        error: "error",
        errorInfo: [
          {
            error: "error",
            errorInfo: undefined,
            getHumanReadableMessage: common.getHumanReadableMessage,
          },
        ],
      },
    );
  }
});

// // TODO this is unnecessary once https://github.com/ty-ras/data/issues/19 is done
// test("Validate that if context transform callback returns error, that error is returned as-is", (t) => {
//   t.plan(1);
//   const returnedError: data.DataValidatorResultError = {
//     error: "error",
//     errorInfo: "",
//     getHumanReadableMessage,
//   };
//   const maybeHandler = spec.
//     startBuildingAPI()
//     .changeStateProvider(
//       () => {
//         throw new Error("This should never be called");
//       },
//     )
//     .refineContext(
//       {
//         getState: () => {
//           throw new Error("This should never be called");
//         },
//         validator: () => ({
//           error: "none",
//           data: "ThisShouldNeverBeSeen",
//         }),
//       },
//       {},
//     ).atURL`/path`
//     .batchSpec({
//       method: "GET",
//       endpointHandler: () => "",
//       output: common.outputSpec(""),
//       mdArgs: {},
//     })
//     .createEndpoint({})
//     .getRegExpAndHandler("")
//     .handler("GET", {});
//   if (maybeHandler.found === "handler") {
//     t.deepEqual(
//       maybeHandler.handler.contextValidator.validator(""),
//       returnedError,
//     );
//   }
// });

const getHumanReadableMessage = () => "";
