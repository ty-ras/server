import type * as ava from "ava";
import type * as ep from "@ty-ras/endpoint";

import * as server from "./server";

export const registerTests = (
  test: ava.TestFn,
  createServer: CreateServer,
  httpVersion: number,
  secure: boolean,
) => {
  const titlePrefix = `Validate ${
    secure ? "plain" : "secure"
  } HTTP${httpVersion} Node server works for`;
  test(`${titlePrefix} for 200`, test200, createServer, httpVersion, secure);
  test(
    `${titlePrefix} 200 with streaming response`,
    test200WithReadable,
    createServer,
    httpVersion,
    secure,
  );
  test(`${titlePrefix} 404`, test404, createServer, httpVersion, secure);
  test(`${titlePrefix} 204`, test204, createServer, httpVersion, secure);
  test(`${titlePrefix} 403`, test403, createServer, httpVersion, secure);
  test(`${titlePrefix} 500`, test500, createServer, httpVersion, secure);
};

const test200: ParametrizedTest = async (...args) => {
  await testServer(...args);
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

export type CreateServer = (
  endpoints: ReadonlyArray<ep.AppEndpoint<unknown, Record<string, unknown>>>,
  info: server.ServerTestAdditionalInfo,
  httpVersion: number,
  secure: boolean,
) => server.AnyHttpServer;

const testServer = (
  t: ava.ExecutionContext,
  createServer: CreateServer,
  httpVersion: number,
  secure: boolean,
  info?: server.ServerTestAdditionalInfo,
) =>
  server.testServer(
    t,
    (endpoints) => createServer(endpoints, info, httpVersion, secure),
    info,
  );

export type ParametrizedTest = (
  t: ava.ExecutionContext,
  createServer: CreateServer,
  httpVersion: number,
  secure: boolean,
) => Promise<void>;

export type HTTPVersionBase = 1 | 2;
