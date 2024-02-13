/**
 * @file This file contains helper method to validate constructed {@link ep.AppEndpoint} by other .spec.ts files.
 */

import type { ExecutionContext } from "ava";
import * as ep from "@ty-ras/endpoint";
import * as data from "@ty-ras/data";
import type * as protocol from "@ty-ras/protocol";
import type * as mp from "./missing-parts";
/* eslint-disable jsdoc/require-jsdoc */

export const validateEndpoint = async (
  c: ExecutionContext,
  endpoint: ep.AppEndpoint<mp.ServerContext, mp.DefaultStateInfo>,
  getInstanceData: () => ReadonlyArray<unknown>,
  prefix = "/api/something",
  processFlattenedHandlerInfo: (info: Array<unknown>) => Array<unknown> = (
    info,
  ) => info,
  expectedOutput: unknown = {
    contentType: "text/plain",
    headers: {
      responseHeader: "resHeader",
    },
    output: JSON.stringify("responseBody"),
  },
  processHandlerArgs: (
    args: ep.AppEndpointHandlerFunctionArgs<mp.ServerContext>,
  ) => ep.AppEndpointHandlerFunctionArgs<mp.ServerContext> = (args) => args,
  method: protocol.HttpMethod = "GET",
  includeContext = false,
) => {
  c.truthy(endpoint, "Given endpoint must be of given type");

  const { handler, url } = endpoint.getRegExpAndHandler("");
  c.deepEqual(
    url.source,
    `${ep.escapeRegExp(prefix).replaceAll("/", "\\/")}\\/(?<urlParam>[^/]+)`,
  );
  const methodOK = handler(
    method,
    // 2nd argument is not used by these endpoints, only by the ones produced by endpoint-prefix library
    {},
  );
  if (methodOK.found === "handler") {
    const { handler, ...handlerInfo } = methodOK.handler;
    // We can't use c.deepEqual directly on handlerInfo as it has a bunch of functions
    // So instead flatten its structure, and replace functions with placeholders, and only then pass to c.deepEqual
    const flattenedHandlerInfo = flatten(handlerInfo).map(
      ([path, value]) =>
        [
          path,
          typeof value === "function" ? functionPlaceHolder : value,
        ] as const,
    );
    flattenedHandlerInfo.sort(([propNameX], [propNameY]) =>
      propNameX.localeCompare(propNameY),
    );
    c.deepEqual(
      flattenedHandlerInfo,
      processFlattenedHandlerInfo([
        ["bodyValidator", functionPlaceHolder],
        ["queryValidator.queryParam", functionPlaceHolder],
        ["stateInformation.stateInfo.0", "userId"],
        ["stateInformation.validator", functionPlaceHolder],
        ["urlValidator.groupNames.urlParam", "urlParam"],
        ["urlValidator.validators.urlParam", functionPlaceHolder],
      ]),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const args: ep.AppEndpointHandlerFunctionArgs<mp.ServerContext> =
      processHandlerArgs({
        context: { req: "req", res: "res" },
        state: {
          userId: "userId",
        },
        url: {
          urlParam: "urlParam",
        },
        query: {
          queryParam: "queryParam",
        },
        body: "requestBody",
        headers: {
          thisShould: "notBeInResult",
        },
      });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await handler(args);
    if (result.error === "none") {
      c.deepEqual(result.data, expectedOutput);
      c.deepEqual(getInstanceData(), [
        data.omit(
          args,
          "headers",
          ...(includeContext ? [] : ["context" as const]),
        ),
      ]);
    } else {
      c.fail("Handler did not return validated response body.");
      c.log(result);
    }
  } else {
    c.fail("Handler getter did not return hander for given HTTP method.");
    c.log(methodOK);
  }
};

const flatten = (obj: unknown) => {
  const isObject = (val: unknown): val is object =>
    !!val && typeof val === "object";

  const addDelimiter = (a: string, b: string) => (a ? `${a}.${b}` : b);

  const paths = (obj = {}, head = ""): Array<[string, unknown]> => {
    return Object.entries(obj).reduce<Array<[string, unknown]>>(
      (product, [key, value]) => {
        const fullPath = addDelimiter(head, key);
        isObject(value)
          ? product.push(...paths(value, fullPath))
          : product.push([fullPath, value]);
        return product;
      },
      [],
    );
  };

  return isObject(obj) ? paths(obj) : [];
};

const functionPlaceHolder = () => {};
