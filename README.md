# Typesafe REST API Specification - HTTP Server Related Generic Libraries

[![CI Pipeline](https://github.com/ty-ras/server/actions/workflows/ci.yml/badge.svg)](https://github.com/ty-ras/server/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/ty-ras/server/actions/workflows/cd.yml/badge.svg)](https://github.com/ty-ras/server/actions/workflows/cd.yml)

The Typesafe REST API Specification is a family of libraries used to enable seamless development of Backend and/or Frontend which communicate via HTTP protocol.
The protocol specification is checked both at compile-time and run-time to verify that communication indeed adhers to the protocol.
This all is done in such way that it does not make development tedious or boring, but instead robust and fun!

This particular repository contains generic HTTP server related libraries, and is designed to be consumed by other TyRAS libraries:
- [endpoint](./endpoint) library exposes `AppEndpoint` interface to represent an endpoint in HTTP REST API to be handled by HTTP server,
- [endpoint-spec](./endpoint-spec) library adds typesafe and easy-to-use builder functionality to holistically construct REST API by defining `AppEndpoint`s using [TS5/ES decorators](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators),
- [server](./server) library adds some common concepts to be used by various TyRAS libaries implementing serving `AppEndpoint`s utilizing some specific HTTP server,
- [server-test-support](./server-test-support) library adds common test suite to be run by TyRAS libraries adding `AppEndpoint` support to various HTTP server frameworks, and
- [state](./state) library defines aspects of generic state concept, which should suffice the vast majority of user code using the state concept.
