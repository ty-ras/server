/**
 * @file This file contains utility methods to patch asynchronous functionality not present in Node.
 */
import * as net from "node:net";

/**
 * The helper function to listen to given {@link net.Server} asynchronously.
 * @param server The {@link net.Server} to listen to.
 * @param host The hostname as string.
 * @param port The port as number.
 * @param backlog The backlog parameter, if any.
 * @returns Asynchronously nothing.
 */
export function listenAsyncGeneric(
  server: net.Server,
  host: string,
  port: number,
  backlog?: number,
): Promise<void>;

/**
 *The helper function to listen to given {@link net.Server} asynchronously.
 * @param server The {@link net.Server} to listen to.
 * @param options The options for listening.
 * @returns Asynchronously nothing.
 */
export function listenAsyncGeneric(
  server: net.Server,
  options: net.ListenOptions,
): Promise<void>;

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
  port?: number,
  backlog?: number,
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
