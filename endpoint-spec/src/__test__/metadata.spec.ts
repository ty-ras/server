/**
 * @file This file contains tests related to metadata-specific functionality of app builder.
 */

import test from "ava";
import * as md from "@ty-ras/metadata";
import * as mp from "./missing-parts";
import * as protocol from "./protocol";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */

test("Verify that using one metadata provider has necessary effects", (c) => {
  c.plan(3);

  const recordArgs: Array<any> = [];
  const app = mp.newBuilder({}).resetMetadataProviders({
    md: newMDProvider(recordArgs),
  });
  const url = app.url`/api/endpoint`({
    md: "urlArg",
  });

  class Class {
    @url<protocol.SimpleEndpoint>({ md: "endpointArg" })({
      method: "GET",
      responseBody: mp.responseBody(protocol.simpleResponseBody),
      state: {},
    })
    endpoint() {
      return "simpleResponseBody" as const;
    }
  }
  c.deepEqual(app.createEndpoints({ md: "finalArg" }, new Class()).metadata, {
    md: "createFinalMetadata",
  });
  // We have to do this because our data will contain functions and .deepEqual does not allow customization of equality comparison.
  c.deepEqual(typeof recordArgs[1].GET.spec.stateInfo.validator, "function");
  delete recordArgs[1].GET.spec.stateInfo["validator"];
  c.deepEqual(recordArgs, [
    {
      md: "urlArg",
      patternSpec: ["/api/endpoint"],
      url: {},
    },
    {
      GET: {
        md: "endpointArg",
        spec: {
          method: "GET",
          query: undefined,
          requestBody: undefined,
          requestHeaders: undefined,
          responseBody: {
            contents: {
              "text/plain": "simpleResponseBody",
            },
          },
          responseHeaders: undefined,
          stateInfo: {
            stateInfo: [],
          },
        },
      },
    },
    "finalArg",
    ["afterDefiningURLEndpoints"],
  ]);
});

interface MetadataProviderHKT extends md.MetadataProviderHKTBase {
  readonly _getParameterWhenSpecifyingURL: string;
  readonly _getParameterWhenSpecifyingEndpoint: string;
  readonly _getReturnWhenSpecifyingEndpoint: string;
  readonly _getParameterWhenCreatingEndpoints: string;
  readonly _getReturnWhenCreatingEndpoints: string;
}

const newMDProvider = (
  recordArgs: Array<any>,
): md.MetadataProvider<
  mp.EncodedHKT,
  mp.ValidatorHKT,
  mp.DefaultStateHKT,
  MetadataProviderHKT
> => ({
  afterDefiningURLEndpoints: (urlArgs, endpoints) => (
    recordArgs.push(urlArgs, endpoints), "afterDefiningURLEndpoints"
  ),
  createFinalMetadata: (mdArg, endpoints) => (
    recordArgs.push(mdArg, endpoints), "createFinalMetadata"
  ),
});
