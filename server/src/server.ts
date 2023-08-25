/**
 * @file This file contains function that can be used to expose uniform way to create Node HTTP servers.
 */

import * as http from "node:http";
import * as https from "node:https";
import * as http2 from "node:http2";
import type * as tls from "node:tls";

/**
 * Creates new non-secure HTTP1 {@link http.Server} using given callback with optional additional configuration via {@link ServerOptions1}.
 * @param handler The {@link HTTP1Handler} callback.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @returns A new non-secure HTTP1 {@link http.Server}.
 */
export function createNodeServer(
  handler: HTTP1Handler,
  opts?: NodeServerOptions1<false>,
): http.Server;

/**
 * Creates new secure HTTP1 {@link https.Server} using given callback with additional configuration via {@link ServerOptions1}.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param handler The {@link HTTP1Handler} callback.
 * @returns A new secure HTTP1 {@link https.Server}.
 */
export function createNodeServer(
  opts: NodeServerOptions1<true>,
  handler: HTTP1Handler,
): https.Server;

/**
 * Creates new non-secure HTTP2 {@link http2.Http2Server} using given callback with additional configuration via {@link ServerOptions2}.
 * Please set `httpVersion` value of `opts` to `2` to use HTTP2 protocol.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param handler The {@link HTTP2Handler} callback.
 * @returns A new non-secure HTTP2 {@link http2.Http2Server}.
 */
export function createNodeServer(
  opts: NodeServerOptions2<false>,
  handler: HTTP2Handler,
): http2.Http2Server;

/**
 * Creates new secure HTTP2 {@link http2.Http2SecureServer} using given callback with additional configuration via {@link ServerOptions2}.
 * Please set `httpVersion` value of `opts` to `2` to use HTTP2 protocol.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param handler The {@link HTTP2Handler} callback.
 * @returns A new secure HTTP2 {@link http2.Http2SecureServer}.
 */
export function createNodeServer(
  opts: NodeServerOptions2<true>,
  handler: HTTP2Handler,
): http2.Http2SecureServer;

/**
 * Creates new secure or non-secure HTTP1 or HTTP2 Node server using given callback with additional configuration via {@link ServerOptions1} or {@link ServerOptions2}.
 * Please set `httpVersion` value of `opts` to `2` to enable HTTP2 protocol, otherwise HTTP1 server will be returned.
 * @param handler The {@link HTTP1Handler} or {@link ServerOptions1} or {@link ServerOptions2}.
 * @param options The {@link ServerOptions1} or {@link HTTP1Handler} or {@link HTTP2Handler}.
 * @returns Secure or non-secure HTTP1 or HTTP2 Node server
 * @see createNodeServerGeneric
 */
export function createNodeServer(
  handler:
    | HTTP1Handler
    | NodeServerOptions1<true>
    | NodeServerOptions2<boolean>,
  options?: NodeServerOptions1<false> | HTTP1Handler | HTTP2Handler,
): http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer {
  return createNodeServerGeneric(
    typeof handler === "function"
      ? ensureObject<NodeServerOptions1<false>, HTTP1Handler | HTTP2Handler>(
          options ?? { options: {} },
        )
      : handler ??
          doThrow(
            "The HTTP server options are mandatory when creating anything other than unsecured HTTP1 server.",
          ),
    typeof handler === "function"
      ? handler
      : typeof options === "function"
      ? options
      : doThrow("The HTTP server callback must be specified."),
  );
}

/**
 * Creates new secure or non-secure HTTP1 or HTTP2 Node server with given callback.
 * Please set `httpVersion` value of `opts` to `2` to enable HTTP2 protocol, otherwise HTTP1 server will be returned.
 * @param opts The {@link ServerOptions1} or {@link ServerOptions2} options.
 * @param handler The {@link HTTP1Handler} or {@link HTTP2Handler} callback.
 * @returns Secure or non-secure HTTP1 or HTTP2 Node server
 * @see {@link createNodeServer} for overloads which deduce correct return type based on input parameters.
 */
export function createNodeServerGeneric(
  opts: NodeServerOptions1<boolean> | NodeServerOptions2<boolean>,
  handler: HTTP1Handler | HTTP2Handler,
): http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer {
  let retVal;
  if ("httpVersion" in opts && opts.httpVersion === 2) {
    const { options, secure } = opts;
    const httpHandler = asyncToVoid(handler);
    if (isSecure(secure, options, 2)) {
      retVal = http2.createSecureServer(options ?? {}, httpHandler);
    } else {
      retVal = http2.createServer(options ?? {}, httpHandler);
    }
  } else {
    const { options, secure } = opts;
    const httpHandler = asyncToVoid(handler);
    if (isSecure(secure, options, 1)) {
      retVal = https.createServer(options ?? {}, httpHandler);
    } else {
      retVal = http.createServer(options ?? {}, httpHandler);
    }
  }
  return retVal;
}

/**
 * This interface contains options common for both HTTP 1 and 2 servers when creating them via {@link createNodeServer}.
 */
export interface NodeServerOptionsBase<TOptions, TSecure extends boolean> {
  /**
   * The further options for the HTTP server.
   */
  options?: TOptions;

  /**
   * Set this to `true` explicitly if automatic detection of server being secure by {@link createNodeServer} fails.
   */
  secure?: TSecure;
}

/**
 * This interface contains options for HTTP 1 servers when creating them via {@link createNodeServer}.
 */
export interface NodeServerOptions1<TSecure extends boolean>
  extends NodeServerOptionsBase<
    boolean extends TSecure
      ? http.ServerOptions | https.ServerOptions
      : true extends TSecure
      ? https.ServerOptions
      : http.ServerOptions,
    TSecure
  > {
  /**
   * Use this property if needed.
   */
  httpVersion?: 1;
}

/**
 * This interface contains options for HTTP 2 servers when creating them via {@link createNodeServer}.
 */
export interface NodeServerOptions2<TSecure extends boolean>
  extends NodeServerOptionsBase<
    boolean extends TSecure
      ? http2.ServerOptions | http2.SecureServerOptions
      : true extends TSecure
      ? http2.SecureServerOptions
      : http2.ServerOptions,
    TSecure
  > {
  /**
   * Set this property to `2` in order to use HTTP2 server when listening.
   */
  httpVersion: 2;
}

/**
 * Generic callback interface used by {@link HTTP1Handler} and {@link HTTP2Handler}.
 */
export type HTTP1Or2Handler<TRequest, TResponse> = (
  req: TRequest,
  res: TResponse,
) => Promise<void>;

/**
 * The callback type for HTTP1 servers.
 */
export type HTTP1Handler = HTTP1Or2Handler<
  http.IncomingMessage,
  http.ServerResponse
>;

/**
 * The callback type for HTTP2 servers.
 */
export type HTTP2Handler = HTTP1Or2Handler<
  http2.Http2ServerRequest,
  http2.Http2ServerResponse
>;

const isSecure = (
  secure: boolean | undefined,
  options: object | undefined,
  version: 1 | 2,
) =>
  secure ||
  (options &&
    (version === 1 ? secureHttp1OptionKeys : secureHttp2OptionKeys).some(
      (propKey) => propKey in options,
    ));

const secureHttp1OptionKeys: ReadonlyArray<keyof tls.TlsOptions> = [
  "key",
  "cert",
  "pfx",
  "passphrase",
  "rejectUnauthorized",
  "ciphers",
  "ca",
  "requestCert",
  "secureContext",
  "secureOptions",
  "secureProtocol",
  "sigalgs",
  "ticketKeys",
  "crl",
  "clientCertEngine",
  "dhparam",
  "ecdhCurve",
  "allowHalfOpen",
  "handshakeTimeout",
  "honorCipherOrder",
  "keepAlive",
  "keepAliveInitialDelay",
  "maxVersion",
  "minVersion",
  "noDelay",
  "pauseOnConnect",
  "privateKeyEngine",
  "privateKeyIdentifier",
  "pskCallback",
  "pskIdentityHint",
  "sessionIdContext",
  "sessionTimeout",
  "ALPNProtocols",
  "SNICallback",
];

const secureHttp2OptionKeys: ReadonlyArray<
  "allowHTTP1" | "origins" | keyof tls.TlsOptions
> = ["allowHTTP1", "origins", ...secureHttp1OptionKeys];

const asyncToVoid =
  (
    asyncCallback: HTTP1Handler | HTTP2Handler,
  ): ((...args: Parameters<typeof asyncCallback>) => void) =>
  (...args) => {
    /* c8 ignore next 3 */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    void asyncCallback(...(args as [any, any]));
  };

const ensureObject = <
  TObject extends object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFunction extends (...args: Array<any>) => any,
>(
  obj: TObject | TFunction,
): TObject => (typeof obj === "function" ? doThrow("Please pass object") : obj);

/**
 * Always throws error. This function exists only because 'throw' clause is a statement in JavaScript, not an expression.
 *
 * This means that it is not possible to do things like `x ?? throw new Error("...")`, but instead has to be `x ?? doThrow("...")`.
 * @param msg The error message to pass to {@link Error} constructor.
 */
const doThrow = (msg: string) => {
  throw new Error(msg);
};
