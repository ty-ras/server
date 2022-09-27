# Typesafe REST API Specification - Server Endpoint Prefixing

[![Coverage](https://codecov.io/gh/ty-ras/server/branch/main/graph/badge.svg?flag=endpoint-prefix)](https://codecov.io/gh/ty-ras/server)

This folder contains library which provides a way to group several `AppEndpoint`s exposed by [endpoint](../endpoint) library into one `AppEndpoint` which is served behind a given URL prefix.
It is common practice to have REST APIs with URL like `/v1/data`, `/v1/user`, etc.
This library can be used to define endpoints with a prefix-agnostic URL, and then later group them by single prefix.

Notice that the prefixed grouped `AppEndpoint`s still produce **one** RegExp to use to match them.
This RegExp match information, using named groups, will provide enough data for the prefixed grouped `AppEndpoint` to delegate its functionality to the actual downstream endpoint.
This yields significant performance increases in the implementation of HTTP server using prefixed `AppEndpoint`s.
