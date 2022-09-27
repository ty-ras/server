# Typesafe REST API Specification - Server Endpoint Prefixing

[![Coverage](https://codecov.io/gh/ty-ras/server/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/ty-ras/server)

This folder contains library which contains types and utility methods used by TyRAS libraries which implement serving `AppEndpoint`s from [endpoint](../endpoint) package using some specific HTTP server.

Currently, there are three such implementations:
- [@ty-ras/server-koa](https://github.com/ty-ras/server-koa) for [Koa](https://koajs.com) server implementation,
- [@ty-ras/server-expressjs](https://github.com/ty-ras/server-expressjs) for [ExpressJS](https://expressjs.com) server implementation, and
- [@ty-ras/server-fastify](https://github.com/ty-ras/server-fastify) for [Fastify](https://www.fastify.io) server implementation.
