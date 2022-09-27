# Typesafe REST API Specification - Server Endpoint Prefixing

[![Coverage](https://codecov.io/gh/ty-ras/server/branch/main/graph/badge.svg?flag=endpoint-prefix)](https://codecov.io/gh/ty-ras/server)

This folder contains library which provides a way to group several `AppEndpoint`s exposed by [endpoint](../endpoint) library into one `AppEndpoint` which is served behind a given URL prefix.
It is common practice to have REST APIs with URL like `/v1/data`, `/v1/user`, etc.
This library can be used to define endpoints with a prefix-agnostic URL, and then later group them by single prefix.
