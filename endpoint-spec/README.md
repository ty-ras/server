# Typesafe REST API Specification - AppEndpoint Specification Builder

[![Coverage](https://codecov.io/gh/ty-ras/server/branch/main/graph/badge.svg?flag=endpoint-spec)](https://codecov.io/gh/ty-ras/server)

This folder contains library which contains types and utility methods to be used by TyRAS users when specifying `AppEndpoint`s defined in [`@ty-ras/endpoint`](../endpoint) library.
It allows typesafe, tested, and making-life-easy way to holistically specify multiple `AppEndpoint`s using [TS5/ES decorators](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators).
These endpoints as a whole will form a full REST API.
