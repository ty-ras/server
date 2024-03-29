/**
 * @file This file contains unit tests for functionality in file `../server.ts`.
 */

import test from "ava";
import * as spec from "../listen";
import getPort from "@ava/get-port";
import * as net from "node:net";

test("Validate that listenAsync works for host and port combination", async (c) => {
  c.plan(1);
  const server = net.createServer(() => {});
  try {
    await c.notThrowsAsync(async () =>
      spec.listenAsyncGeneric(server, "localhost", await getPort(), undefined),
    );
  } finally {
    server.close();
  }
});

test("Validate that listenAsync works for options object", async (c) => {
  c.plan(1);
  const server = net.createServer(() => {});
  try {
    await c.notThrowsAsync(async () =>
      spec.listenAsyncGeneric(
        server,
        {
          host: "localhost",
          port: await getPort(),
        },
        undefined,
        undefined,
      ),
    );
  } finally {
    server.close();
  }
});

test("Validate that listenAsync works when error in starting listening", async (c) => {
  c.plan(3);
  const server = net.createServer(() => {});
  try {
    const port = await getPort();
    await c.notThrowsAsync(
      async () =>
        await spec.listenAsyncGeneric(server, "localhost", port, undefined),
    );
    // Listening same host + port on same server should insta-throw
    await c.throwsAsync(
      async () =>
        await spec.listenAsyncGeneric(server, "localhost", port, undefined),
      {
        instanceOf: Error,
      },
    );

    // Listening same host + port on different server should throw via event
    await c.throwsAsync(
      async () =>
        await spec.listenAsyncGeneric(
          net.createServer(() => {}),
          "localhost",
          port,
          undefined,
        ),
      {
        instanceOf: Error,
      },
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});
