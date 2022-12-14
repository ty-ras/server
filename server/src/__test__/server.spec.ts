import test from "ava";
import * as spec from "../server";
import getPort from "@ava/get-port";
import * as net from "net";

test("Validate that listenAsync works for host and port combination", async (c) => {
  c.plan(1);
  const server = net.createServer(() => {});
  try {
    await c.notThrowsAsync(async () =>
      spec.listenAsync(server, "localhost", await getPort()),
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
      spec.listenAsync(server, {
        host: "localhost",
        port: await getPort(),
      }),
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
      async () => await spec.listenAsync(server, "localhost", port),
    );
    // Listening same host + port on same server should insta-throw
    await c.throwsAsync(
      async () => await spec.listenAsync(server, "localhost", port),
      {
        instanceOf: Error,
      },
    );

    // Listening same host + port on different server should throw via event
    await c.throwsAsync(
      async () =>
        await spec.listenAsync(
          net.createServer(() => {}),
          "localhost",
          port,
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
