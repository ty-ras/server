/**
 * @file This file contains code used to register a collection of tests to AVA runner.
 */

import type * as ava from "ava";
import type * as ep from "@ty-ras/endpoint";

import * as server from "./server";

/**
 * Registers a bunch of tests to run against given TyRAS HTTP server implementation using AVA runtime.
 * @param test The AVA test runtime.
 * @param createServer The callback to create HTTP server.
 * @param opts The {@link RegisterTestsOptions}.
 */
export const registerTests = (
  test: ava.TestFn,
  createServer: CreateServer,
  opts?: RegisterTestsOptions,
) => {
  const { run500Test, ...options } = opts ?? {};
  const input: TestsInput = {
    createServer,
    httpVersion: opts?.httpVersion ?? 1,
    secure: options.secure === true,
    ...options,
  };
  const titlePrefix = `Validate ${input.secure ? "secure" : "plain"} HTTP${
    input.httpVersion
  } server works for`;
  test(`${titlePrefix} 200`, test200, input);
  test(
    `${titlePrefix} 200 with streaming response`,
    test200WithReadable,
    input,
  );
  test(`${titlePrefix} 404`, test404, input);
  test(`${titlePrefix} 204`, test204, input);
  test(`${titlePrefix} 403`, test403, input);
  if (run500Test) {
    test(`${titlePrefix} 500`, test500, input);
  }
};

/**
 * The options for {@link registerTests}.
 */
export type RegisterTestsOptions = Partial<
  Omit<TestsInput, "createServer"> & {
    run500Test: boolean; // Only makes sense when there are extra code other than invoking typicalServerFlow.
  }
>;

/**
 * This interface contains necessary data to register tests via {@link registerTests}.
 */
export interface TestsInput {
  /**
   * The callback to create the TyRAS HTTP server.
   */
  createServer: CreateServer;

  /**
   * The suffix for content types.
   */
  contentTypeHeaderSuffix?: string | undefined;

  /**
   * The HTTP protocol version.
   */
  httpVersion: number;

  /**
   * Whether the server is secure.
   */
  secure: boolean;
}

const test200: ParametrizedTest = async (...args) => {
  await testServer(...args, undefined);
};

const test200WithReadable: ParametrizedTest = async (...args) => {
  await testServer(...args, 200);
};

const test404: ParametrizedTest = async (...args) => {
  await testServer(...args, {
    regExp: /ungrouped-regexp-will-never-match/,
    expectedStatusCode: 404,
  });
};

const test204: ParametrizedTest = async (...args) => {
  await testServer(...args, 204);
};

const test403: ParametrizedTest = async (...args) => {
  await testServer(...args, 403);
};

const test500: ParametrizedTest = async (...args) => {
  await testServer(...args, 500);
};

/**
 * Callback to create TyRAS HTTP server.
 */
export type CreateServer = (
  endpoints: ReadonlyArray<ep.AppEndpoint<unknown, unknown>>,
  info: server.ServerTestAdditionalInfo[0],
  httpVersion: number,
  secure: boolean,
) => server.AnyHttpServer;

const testServer = (
  t: ava.ExecutionContext,
  { createServer, contentTypeHeaderSuffix, httpVersion, secure }: TestsInput,
  info?: server.ServerTestAdditionalInfo[0],
) =>
  server.testServer(
    t,
    (endpoints) => createServer(endpoints, info, httpVersion, secure),
    info,
    contentTypeHeaderSuffix,
  );

/**
 * The callback type for parametrized type.
 */
export type ParametrizedTest = (
  t: ava.ExecutionContext,
  input: TestsInput,
) => Promise<void>;

/**
 * The base constraint type for HTTP version.
 */
export type HTTPVersionBase = 1 | 2;
