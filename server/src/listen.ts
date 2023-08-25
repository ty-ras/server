/**
 * @file This file contains utility methods to patch asynchronous functionality not present in Node.
 */

import * as net from "node:net";

/**
 * The helper function to listen to given {@link net.Server} asynchronously.
 * @param server The {@link net.Server} to listen to.
 * @param hostOrOptions The {@link net.ListenOptions}.
 * @param port The port to listen to.
 * @param backlog The backlog parameter, if any.
 * @returns Asynchronously nothing.
 */
export function listenAsyncGeneric(
  server: net.Server,
  hostOrOptions: string | net.ListenOptions,
  port: number | undefined,
  backlog: number | undefined,
) {
  const options: net.ListenOptions =
    typeof hostOrOptions === "string"
      ? {
          host: hostOrOptions,
          port: port,
          backlog: backlog,
        }
      : hostOrOptions;
  return new Promise<void>((resolve, reject) => {
    try {
      server.addListener("error", reject);
      server.listen(options, () => {
        server.removeListener("error", reject);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
