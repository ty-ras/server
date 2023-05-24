/**
 * @file This file contains code for creating callback to destroy a {@link net.Server}.
 */
import * as net from "node:net";
import * as crypto from "node:crypto";
import type * as stream from "node:stream";

/**
 * Creates a callback to destroy the given {@link net.Server}.
 * @param server The {@link net.Server} to destroy when calling the returned callback.
 * @returns A callback to destroy the given server.
 */
export const createDestroyCallback = (server: net.Server) => {
  const connections: Record<string, net.Socket | stream.Duplex> = {};

  server.on("connection", (conn: net.Socket | stream.Duplex) => {
    const key =
      conn instanceof net.Socket
        ? `${conn.remoteAddress}:${conn.remotePort}`
        : crypto.randomUUID();
    connections[key] = conn;
    conn.on("close", () => {
      delete connections[key];
    });
  });

  return () => {
    return new Promise<void>((resolve, reject) => {
      let closed = false;
      let connsDestroyed = false;
      const errors: Array<unknown> = [];
      const resolveOrReject = (err: unknown) => {
        if (err) {
          errors.push(err);
        }
        if (closed && connsDestroyed) {
          errors.length > 0 ? reject(errors) : resolve();
        }
      };
      server.close((err) => {
        closed = true;
        resolveOrReject(err);
      });
      for (const [id, connection] of Object.entries(connections)) {
        connection.destroy();
        delete connections[id];
      }
      connsDestroyed = true;
      resolveOrReject(undefined);
    });
  };
};
