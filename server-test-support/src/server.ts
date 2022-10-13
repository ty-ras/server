import type * as ava from "ava";
import getPort from "@ava/get-port";

import * as destroy from "./destroy";
import * as request from "./request";

import type * as ep from "@ty-ras/endpoint";

import * as http from "http";
import * as http2 from "http2";
import * as https from "https";
import * as net from "net";
import * as stream from "stream";
import * as rawBody from "raw-body";

export const testServer = async (
  t: ava.ExecutionContext,
  createServer: (
    endpoint: Array<ep.AppEndpoint<unknown, unknown, never>>,
  ) => AnyHttpServer,
  ...infos: ServerTestAdditionalInfo // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const [info, contentTypeSuffix] = infos;
  const isError = typeof info === "object";
  const isProtocolError = info === 403;
  const state = "State";
  const responseData = info === 204 ? undefined : state;
  const noRequestBody = isError || info === 403 || info === 500;
  t.plan(isError || isProtocolError || info === 500 ? 2 : 1);
  const responseIsStreamed = info === 200;
  const serverObj = createServer([
    getAppEndpoint(
      isError ? info?.regExp : /^\/(?<group>path)$/,
      isProtocolError ? info : undefined,
      state,
      responseIsStreamed ? stream.Readable.from([responseData]) : responseData,
      noRequestBody,
    ),
  ]);
  const isDirectlyServer =
    serverObj instanceof https.Server || serverObj instanceof http.Server;
  const server = isDirectlyServer ? serverObj : serverObj.server;
  // AVA runs tests in parallel -> use plugin to get whatever available port
  const host = "localhost";
  const port = await getPort();
  const destroyServer = destroy.createDestroyCallback(server);
  try {
    // Start the server
    await (isDirectlyServer || !serverObj.customListen
      ? listenAsync(server, host, port)
      : serverObj.customListen(host, port));
    const requestOpts: http.RequestOptions = {
      protocol:
        server instanceof https.Server ||
        (!isDirectlyServer && serverObj.secure)
          ? "https:"
          : "http:",
      hostname: host,
      port,
      method: "GET",
      path: "/path",
    };
    const isHttp2 = !(
      server instanceof http.Server || server instanceof https.Server
    );
    if (noRequestBody) {
      await performFailingTest(
        t,
        requestOpts,
        isError ? info.expectedStatusCode : info,
        isHttp2,
      );
    } else {
      await performSuccessfulTest(
        t,
        requestOpts,
        responseData,
        contentTypeSuffix ?? "",
        isHttp2,
        responseIsStreamed,
      );
    }
  } finally {
    try {
      // Shut down the server
      await destroyServer();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to destroy server, the test might become stuck...");
    }
  }
};

const getAppEndpoint = (
  regExp: RegExp,
  protocolError: number | undefined,
  state: string,
  output: string | stream.Readable | undefined,
  noRequestBody: boolean,
): ep.AppEndpoint<unknown, unknown, never> => ({
  getRegExpAndHandler: () => ({
    url: regExp,
    handler: () => {
      const retVal: ep.StaticAppEndpointHandler<unknown, unknown> = {
        stateValidator: {
          stateInfo: undefined,
          validator: (ctx) =>
            protocolError === undefined
              ? {
                  error: "none",
                  data: ctx,
                }
              : {
                  error: "protocol-error",
                  statusCode: 403,
                  body: undefined,
                },
        },
        handler: () => ({
          error: "none",
          data: {
            contentType: JSON_CONTENT_TYPE,
            output,
            headers: {
              "response-header-name": "response-header-value",
            },
          },
        }),
      };
      if (!noRequestBody) {
        retVal.bodyValidator = async ({ contentType, input }) => {
          const bodyString = await rawBody.default(input, {
            encoding: "utf8",
          });
          return JSON.parse(bodyString) === "input"
            ? {
                error: "none",
                data: {
                  contentType,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  content: "input",
                },
              }
            : {
                error: "error",
                errorInfo: "Info",
                getHumanReadableMessage: () => "",
              };
        };
      }
      return {
        found: "handler",
        handler: retVal,
      };
    },
  }),
  getMetadata: () => {
    throw new Error("This should never be called.");
  },
});

const listenAsync = (server: net.Server, host: string, port: number) =>
  new Promise<void>((resolve, reject) => {
    try {
      server.listen(port, host, () => resolve());
    } catch (e) {
      reject(e);
    }
  });

const performSuccessfulTest = async (
  t: ava.ExecutionContext,
  requestOpts: http.RequestOptions,
  responseData: string | undefined,
  contentTypeSuffix: string,
  isHttp2: boolean,
  responseWasStreamed: boolean,
) => {
  requestOpts.method = "POST";
  requestOpts.headers = {
    "Content-Type": JSON_CONTENT_TYPE,
  };
  // Send the request
  const response = await (isHttp2
    ? request.requestAsync2(requestOpts, writeInput)
    : request.requestAsync(requestOpts, writeInput));
  // Let's not test these headers as they vary every time
  delete response.headers["date"];
  delete response.headers["etag"];
  // This is not present in http2
  delete response.headers["connection"];
  const expectedHeaders: Record<string, string> = {
    "response-header-name": "response-header-value",
  };
  if (responseData !== undefined) {
    expectedHeaders[
      "content-type"
    ] = `${JSON_CONTENT_TYPE}${contentTypeSuffix}`;
    if (responseWasStreamed) {
      if (!isHttp2) {
        expectedHeaders["transfer-encoding"] = "chunked";
      }
    } else {
      expectedHeaders["content-length"] = "5";
    }
  }
  t.deepEqual(response, {
    data: responseData,
    headers: expectedHeaders,
  });
};

const performFailingTest = async (
  t: ava.ExecutionContext,
  requestOpts: http.RequestOptions,
  expectedStatusCode: number,
  isHttp2: boolean,
) => {
  const thrownError = await t.throwsAsync<request.RequestError>(
    async () =>
      await (isHttp2
        ? request.requestAsync2(requestOpts)
        : request.requestAsync(requestOpts)),
    {
      instanceOf: request.RequestError,
      message: request.getErrorMessage(expectedStatusCode),
    },
  );
  if (thrownError) {
    t.deepEqual(thrownError.statusCode, expectedStatusCode);
  }
};

const JSON_CONTENT_TYPE = "application/json";

const writeInput = (writable: stream.Writable) => {
  writable.write(JSON.stringify("input"));
  return Promise.resolve();
};

export type AnyHttpServer =
  | http.Server
  | https.Server
  | {
      server:
        | http.Server
        | https.Server
        | http2.Http2Server
        | http2.Http2SecureServer;
      secure: boolean; // Only used if http 2
      customListen?: (host: string, port: number) => Promise<void>;
    };

export type ServerTestAdditionalInfo = [
  (
    | undefined
    | {
        regExp: RegExp;
        expectedStatusCode: number;
      }
    | 204
    | 200
    | 403
    | 500
  ),
  string | undefined, // suffix for value of content-type of response
];
