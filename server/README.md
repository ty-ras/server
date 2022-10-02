# Typesafe REST API Specification - Server Skeleton Implementation

[![Coverage](https://codecov.io/gh/ty-ras/server/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/ty-ras/server)

This folder contains library which contains types and utility methods used by TyRAS libraries which implement serving `AppEndpoint`s from [endpoint](../endpoint) package using some specific HTTP server.

Currently, there are four such implementations:
- [@ty-ras/server-node](https://github.com/ty-ras/server-node) for [Node HTTP](https://nodejs.org/api/http.html) server implementation (including [https](https://nodejs.org/api/https.html) and [HTTP/2](https://nodejs.org/api/http2.html)),
- [@ty-ras/server-koa](https://github.com/ty-ras/server-koa) for [Koa](https://koajs.com) server implementation,
- [@ty-ras/server-expressjs](https://github.com/ty-ras/server-expressjs) for [ExpressJS](https://expressjs.com) server implementation, and
- [@ty-ras/server-fastify](https://github.com/ty-ras/server-fastify) for [Fastify](https://www.fastify.io) server implementation.
