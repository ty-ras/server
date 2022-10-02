import * as http from "http";
import * as https from "https";
import * as http2 from "http2";
import type * as stream from "stream";

export const requestAsync = (
  opts: http.RequestOptions,
  write?: (writeable: stream.Writable) => Promise<void>,
) =>
  new Promise<{
    headers: http.IncomingHttpHeaders;
    data: string | undefined;
  }>((resolve, reject) => {
    const agent =
      opts.protocol === "http:"
        ? undefined
        : new https.Agent({
            rejectUnauthorized: false,
          });
    const writeable = http
      .request({ ...opts, agent }, (resp) => {
        resp.setEncoding("utf8");
        let data: string | undefined;
        const headers = resp.headers;
        const statusCode = resp.statusCode;

        // A chunk of data has been received.
        resp.on("data", (chunk: string) => {
          if (data === undefined) {
            data = chunk;
          } else {
            data += chunk;
          }
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          if (statusCode === undefined || statusCode >= 400) {
            reject(new RequestError(statusCode, getErrorMessage(statusCode)));
          } else {
            resolve({
              headers,
              data,
            });
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
    if (write && opts.method !== "GET") {
      void awaitAndThen(write(writeable), () => writeable.end(), reject);
    } else {
      writeable.end();
    }
  });

export const requestAsync2 = (
  opts: http.RequestOptions,
  write?: (writeable: stream.Writable) => Promise<void>,
) =>
  new Promise<{
    headers: http2.IncomingHttpHeaders;
    data: string | undefined;
    // eslint-disable-next-line sonarjs/cognitive-complexity
  }>((resolve, reject) => {
    const session = http2.connect(
      `${opts.protocol}//${opts.hostname}:${opts.port}`,
      {
        rejectUnauthorized: false,
      },
    );
    const request = session.request({
      ...(opts.headers ?? {}),
      // [http2.constants.HTTP2_HEADER_SCHEME]: "https",
      [http2.constants.HTTP2_HEADER_PATH]: opts.path ?? "",
      [http2.constants.HTTP2_HEADER_METHOD]: opts.method ?? "",
    });
    request.setEncoding("utf8");

    let headers: http2.IncomingHttpHeaders = {};
    request.on("response", (hdrs) => {
      headers = hdrs;
    });
    let data: string | undefined;
    request.on("data", (chunk) => {
      if (data === undefined) {
        data = chunk as string;
      } else {
        data += chunk;
      }
    });
    request.on("end", () => {
      session.close();
      const statusCodeVal = headers[http2.constants.HTTP2_HEADER_STATUS];
      const statusCode =
        typeof statusCodeVal === "number" ? statusCodeVal : undefined;
      if (statusCode === undefined || statusCode >= 400) {
        reject(new RequestError(statusCode, getErrorMessage(statusCode)));
      } else {
        resolve({
          data,
          // Remove symbols and pseudoheaders
          headers: Object.entries(headers).reduce<typeof headers>(
            (acc, [k, v]) =>
              typeof k == "symbol" || k === http2.constants.HTTP2_HEADER_STATUS
                ? acc
                : ((acc[k] = v), acc),
            {},
          ),
        });
      }
    });
    request.on("error", (error) => {
      session.destroy();
      reject(error);
    });

    if (write && opts.method !== "GET") {
      void awaitAndThen(write(request), () => request.end(), reject);
    } else {
      request.end();
    }
  });

const awaitAndThen = async (
  awaitable: Promise<void>,
  onEnd: () => void,
  reject: (err: unknown) => void,
) => {
  try {
    await awaitable;
    onEnd();
  } catch (e) {
    reject(e);
  }
};

export class RequestError extends Error {
  public constructor(
    public readonly statusCode: number | undefined,
    message: string,
  ) {
    super(message);
  }
}

export const getErrorMessage = (statusCode: number | undefined) =>
  `Status code: ${statusCode}`;
