import test from "ava";
import * as spec from "../methods";

test("Validate isMethodWithoutRequestBody works", (t) => {
  t.plan(5);
  for (const [method, result] of Object.entries({
    OPTIONS: true,
    GET: true,
    POST: false,
    PUT: false,
    DELTE: false,
  })) {
    t.deepEqual(
      spec.isMethodWithoutRequestBody(method as spec.HttpMethod),
      result,
      "The return value of isMethodWithoutRequestBody must be expected",
    );
  }
});
