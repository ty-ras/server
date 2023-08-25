/**
 * @file This file contains unit tests for functionality in file `../server-node.ts`.
 */

import test from "ava";
import * as spec from "../server";
import * as expect from "ts-expect";

import type * as http from "node:http";
import type * as https from "node:https";
import type * as http2 from "node:http2";

// When these errors fail, it will happen already on compile-time.
// But still need to have this code to actually call the functions.

test("Validate that non-secure HTTP1 overload of createNodeServer works", (c) => {
  expect.expectType<http.Server>(spec.createNodeServer(handler1));
  expect.expectType<http.Server>(
    spec.createNodeServer(handler1, {
      options: {},
    }),
  );
  expect.expectType<http.Server>(
    spec.createNodeServer(handler1, {
      options: {},
      httpVersion: 1,
      secure: false,
    }),
  );
  c.pass();
});

test("Validate that secure HTTP1 overload of createNodeServer works", (c) => {
  expect.expectType<https.Server>(
    spec.createNodeServer({ options: { cert: "" } }, handler1),
  );
  expect.expectType<https.Server>(
    spec.createNodeServer({ options: {} }, handler1),
  );
  expect.expectType<https.Server>(
    spec.createNodeServer(
      { options: {}, httpVersion: 1, secure: true },
      handler1,
    ),
  );
  c.pass();
});

test("Validate that non-secure HTTP2 overload of createNodeServer works", (c) => {
  expect.expectType<http2.Http2Server>(
    spec.createNodeServer({ httpVersion: 2, options: {} }, handler2),
  );
  expect.expectType<http2.Http2Server>(
    spec.createNodeServer(
      {
        options: {},
        httpVersion: 2,
        secure: false,
      },
      handler2,
    ),
  );
  c.pass();
});

test("Validate that secure HTTP2 overload of createNodeServer works", (c) => {
  expect.expectType<http2.Http2SecureServer>(
    spec.createNodeServer({ httpVersion: 2, options: { cert: "" } }, handler2),
  );
  // Notice that simply passing 'options: {}' will not work for secure http2 server overload!
  expect.expectType<http2.Http2SecureServer>(
    spec.createNodeServer(
      { options: {}, httpVersion: 2, secure: true },
      handler2,
    ),
  );
  c.pass();
});

test("Validate that passing invalid parameters is caught", (c) => {
  c.plan(2);
  c.throws(
    () => spec.createNodeServer(undefined as unknown as spec.HTTP1Handler),
    {
      instanceOf: Error,
      message:
        "The HTTP server options are mandatory when creating anything other than unsecured HTTP1 server.",
    },
  );
  c.throws(
    () =>
      spec.createNodeServer(
        { options: {} },
        undefined as unknown as spec.HTTP1Handler,
      ),
    {
      instanceOf: Error,
      message: "The HTTP server callback must be specified.",
    },
  );
});

/* eslint-disable @typescript-eslint/no-unused-vars */

const handler1 = (_req: http.IncomingMessage, _res: http.ServerResponse) =>
  Promise.resolve();

const handler2 = (
  _req: http2.Http2ServerRequest,
  _res: http2.Http2ServerResponse,
) => Promise.resolve();
