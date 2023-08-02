# Typesafe REST API Specification - State Definition Skeleton Implementation

[![Coverage](https://codecov.io/gh/ty-ras/server/branch/main/graph/badge.svg?flag=state)](https://codecov.io/gh/ty-ras/server)

This folder contains library which refines the types defined in TyRAS [`data-backend`](https://codecov.io/gh/ty-ras/data) library.
While the state definition [higher-kinded type (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) in `data-backend` leaves out all the details, and does so on purpose, this library adds some main guidelines to the HKT.

The guidelines added are the following:
- The _state type_ itself is an object, each property containing some specific aspect definable by user code,
- Each such property either is _authenticated_ or _not authenticated_ state.
    - Example of _authenticated_ state could be e.g. username extracted from JWT token.
- The _state specification type_ is an object, each property containing information about whether the target _state type object_ property is optional or required.
- The _state information type_ is an array of property names of _state specification object_.

With the guidelines above, using the state concept in TyRAS should be suitable for vast majority of the cases.
The remaining usecases can have their own state usage definition utilising the `data-backend` base types.