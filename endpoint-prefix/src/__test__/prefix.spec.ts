/**
 * @file This file contains tests for file `../prefix.ts`.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import test, { ExecutionContext } from "ava";
import type * as ep from "@ty-ras/endpoint";
import type * as data from "@ty-ras/data";
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
    Record<data.HttpMethod, ep.DynamicHandlerResponse<unknown, unknown>>
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
    const prefixedResponse = prefixedHandler.handler(
      method as data.HttpMethod,
      {
        [groupName]: "url",
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
    Record<data.HttpMethod, ep.DynamicHandlerResponse<unknown, unknown>>
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
        method as data.HttpMethod,
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

test("Validate atPrefix detects top-level prefix but doesn't throw if prefix string is also empty", (t) => {
  t.plan(2);
  const topLevel = spec.atPrefix("", {
    getRegExpAndHandler: () => {
      throw new Error("This should never be called");
    },
  });
  t.is(
    spec.atPrefix("", topLevel),
    topLevel,
    "When prefixing just top-level-prefixed endpoint with top-level prefix (empty string), the top-level-prefixed endpoint itself must be returned.",
  );

  t.throws(
    () => spec.atPrefix("", topLevel, topLevel),
    {
      instanceOf: spec.InvalidEndpointsError,
      message:
        "Endpoints at indices 0, 1 were top-level endpoints and thus unprefixable.",
    },
    "When top-level-prefixed endpoint is just one of many when doing another top-level prefix, exception must be thrown.",
  );
});

const customRegExpGroupNameTest = (
  c: ExecutionContext,
  isTopLevel: boolean,
) => {
  c.plan(1);

  const url = /\/url/;
  const singleEP: ep.AppEndpoint<unknown, unknown> = {
    getRegExpAndHandler: () => ({
      url,
      handler: () => {
        throw new Error("This should never be called in this test.");
      },
    }),
  };

  c.deepEqual(
    spec
      .atPrefix("/urlPrefix", "groupPrefix", singleEP)
      .getRegExpAndHandler(isTopLevel ? "" : "anotherPrefix").url,
    isTopLevel
      ? // When this is top-level, the given groupPrefix is not used
        /\/urlPrefix((?<e_0>^\/url$))/
      : // When this is not top-level, then the given groupPrefix is used
        /\/urlPrefix((?<anotherPrefixgroupPrefix_0>\/url$))/,
  );
};

test(
  "Validate atPrefix takes the custom regexp group name into account, as top-level endpoint",
  customRegExpGroupNameTest,
  true,
);
test(
  "Validate atPrefix takes the custom regexp group name into account, as inner endpoint",
  customRegExpGroupNameTest,
  false,
);
