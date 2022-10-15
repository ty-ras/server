/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from "ava";
import type * as ep from "@ty-ras/endpoint";
import * as spec from "../prefix";

test("Validate atPrefix works with no endpoints", (t) => {
  t.plan(6);
  const { getRegExpAndHandler } = spec.atPrefix("prefix");
  const { url, handler } = getRegExpAndHandler("group");
  t.deepEqual(url, /prefix()/);
  for (const method of ["GET", "POST", "DELETE", "PUT", "OPTIONS"] as const) {
    t.deepEqual(handler(method, {}), {
      found: INVALID_METHOD,
      allowedMethods: [],
    });
  }
});

const testOneURLWithPrefix = (
  t: ExecutionContext,
  prefix: string,
  isTopLevel: boolean,
) => {
  t.plan(6);

  const url = /url/;
  const singleEP: ep.StaticAppEndpointHandler<unknown, unknown> = {
    stateValidator: {
      stateInfo: undefined,
      validator: () => ({ error: "none", data: {} }),
    },
    handler: () => ({
      error: "none",
      data: {
        contentType: "application/json",
        output: "output",
      },
    }),
  };
  const responses: Partial<
    Record<ep.HttpMethod, ep.DynamicHandlerResponse<unknown, unknown>>
  > = {
    // Create copies of singleEP because using t.is below
    GET: {
      found: "handler",
      handler: { ...singleEP },
    },
    POST: {
      found: "handler",
      handler: { ...singleEP },
    },
  };
  const prefixed = spec.atPrefix(prefix, {
    getRegExpAndHandler: () => {
      return {
        url,
        handler: (method) => responses[method]!,
      };
    },
  });
  // Creating 'top-level' regexp (to be used by actual HTTP server, and not by user prefixing other endpoints) is signalled by passing empty string as group name prefix to getRegExpAndHandler
  const groupNamePrefix = isTopLevel ? "" : "group";
  const prefixedHandler = prefixed.getRegExpAndHandler(groupNamePrefix);
  const groupName = `${
    isTopLevel ? "e" : `${groupNamePrefix}${prefix.replaceAll("/", "")}`
  }_0`;
  t.deepEqual(
    prefixedHandler.url,
    new RegExp(`${prefix}((?<${groupName}>${isTopLevel ? `^` : ""}url$))`),
  );
  for (const method of ["GET", "POST", "DELETE", "PUT", "OPTIONS"] as const) {
    const prefixedResponse = prefixedHandler.handler(method as ep.HttpMethod, {
      [groupName]: "url",
    });
    const expectedResponse = responses[method];
    if (expectedResponse) {
      t.is(
        prefixedResponse,
        expectedResponse,
        "Prefixed response must result in same underlying response",
      );
    } else {
      t.deepEqual(
        prefixedResponse,
        {
          found: INVALID_METHOD,
          // Prefixed handler doesn't really know which methods are accepted
          // This is perhaps something to be fixed later.
          // Although, the expectation and assumption of the prefixedHandler.handler method is that RegExp it gave has matched to URL.
          // Thus, this is a bit unrealistic test case.
          allowedMethods: [],
        },
        "Prefixed response must not be some extra handler",
      );
    }
  }
};

test(
  "Validate atPrefix works with one URL and empty prefix",
  testOneURLWithPrefix,
  "",
  false,
);

test(
  "Validate atPrefix works with one URL and non-empty prefix",
  testOneURLWithPrefix,
  "prefix/",
  false,
);

test(
  "Validate atPrefix works with one URL and empty prefix at top level",
  testOneURLWithPrefix,
  "",
  true,
);

test(
  "Validate atPrefix works with one URL and non-empty prefix at top level",
  testOneURLWithPrefix,
  "prefix/",
  true,
);

const testTwoURLsWithPrefix = (
  t: ExecutionContext,
  prefix: string,
  isTopLevel: boolean,
) => {
  t.plan(11);

  const singleEP: ep.StaticAppEndpointHandler<unknown, unknown> = {
    stateValidator: {
      stateInfo: undefined,
      validator: () => ({ error: "none", data: {} }),
    },
    handler: () => ({
      error: "none",
      data: {
        contentType: "application/json",
        output: "output",
      },
    }),
  };
  const responses: Partial<
    Record<ep.HttpMethod, ep.DynamicHandlerResponse<unknown, unknown>>
  > = {
    // Create copies of singleEP because using t.is below
    GET: {
      found: "handler",
      handler: { ...singleEP },
    },
    POST: {
      found: "handler",
      handler: { ...singleEP },
    },
  };
  const urls = ["url", "the-url"];
  const prefixed = spec.atPrefix(
    prefix,
    {
      getRegExpAndHandler: () => {
        return {
          url: new RegExp(urls[0]),
          handler: (method) => responses[method]!,
        };
      },
    },
    {
      getRegExpAndHandler: () => {
        return {
          url: new RegExp(urls[1]),
          handler: (method) => responses[method]!,
        };
      },
    },
  );
  // Creating 'top-level' regexp (to be used by actual HTTP server, and not by user prefixing other endpoints) is signalled by passing empty string as group name prefix to getRegExpAndHandler
  const groupNamePrefix = isTopLevel ? "" : "group";
  const prefixedHandler = prefixed.getRegExpAndHandler(groupNamePrefix);
  const groupNames = [
    `${isTopLevel ? "e" : `${groupNamePrefix}${prefix.replaceAll("/", "")}`}_0`,
    `${isTopLevel ? "e" : `${groupNamePrefix}${prefix.replaceAll("/", "")}`}_1`,
  ];
  t.deepEqual(
    prefixedHandler.url,
    new RegExp(
      `${prefix}(${groupNames
        .map(
          (groupName, idx) =>
            `(?<${groupName}>${isTopLevel ? `^` : ""}${urls[idx]}$)`,
        )
        .join("|")})`,
    ),
  );
  for (const method of ["GET", "POST", "DELETE", "PUT", "OPTIONS"] as const) {
    for (const groupName of groupNames) {
      const prefixedResponse = prefixedHandler.handler(
        method as ep.HttpMethod,
        {
          [groupName]: "will-be-ignored-because-no-url-parameter-parsing",
        },
      );
      const expectedResponse = responses[method];
      if (expectedResponse) {
        t.is(
          prefixedResponse,
          expectedResponse,
          "Prefixed response must result in same underlying response",
        );
      } else {
        t.deepEqual(
          prefixedResponse,
          {
            found: INVALID_METHOD,
            // Prefixed handler doesn't really know which methods are accepted
            // This is perhaps something to be fixed later.
            // Although, the expectation and assumption of the prefixedHandler.handler method is that RegExp it gave has matched to URL.
            // Thus, this is a bit unrealistic test case.
            allowedMethods: [],
          },
          "Prefixed response must not be some extra handler",
        );
      }
    }
  }
};

test(
  "Validate atPrefix works with many URLs and empty prefix",
  testTwoURLsWithPrefix,
  "",
  false,
);

test(
  "Validate atPrefix works with many URLs and non-empty prefix",
  testTwoURLsWithPrefix,
  "prefix/",
  false,
);

test(
  "Validate atPrefix works with many URLs and empty prefix at top level",
  testTwoURLsWithPrefix,
  "",
  true,
);

test(
  "Validate atPrefix works with many URLs and non-empty prefix at top level",
  testTwoURLsWithPrefix,
  "prefix/",
  true,
);

const INVALID_METHOD = "invalid-method";

test("Validate atPrefix detects top-level prefix", (t) => {
  t.plan(1);
  t.throws(
    () =>
      spec.atPrefix(
        "some-prefix",
        spec.atPrefix("", {
          getRegExpAndHandler: () => {
            throw new Error("This should never be called");
          },
        }),
      ),
    {
      instanceOf: spec.InvalidEndpointsError,
      message:
        "Endpoints at indices 0 were top-level endpoints and thus unprefixable.",
    },
  );
});
