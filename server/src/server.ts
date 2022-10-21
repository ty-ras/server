import * as net from "net";

export function listenAsync(
  server: net.Server,
  host: string,
  port: number,
  backlog?: number,
): Promise<void>;
export function listenAsync(
  server: net.Server,
  options: net.ListenOptions,
): Promise<void>;
export function listenAsync(
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
