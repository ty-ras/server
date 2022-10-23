import test from "ava";
import * as spec from "../methods";

test("Validate isMethodWithoutRequestBody works", (t) => {
  t.plan(8);
  for (const [method, result] of Object.entries(methodRequestBodySpec)) {
    t.deepEqual(
      spec.isMethodWithoutRequestBody(method as spec.HttpMethod),
      result,
      `The return value of isMethodWithoutRequestBody for ${method} must be expected`,
    );
  }
});

const methodRequestBodySpec: Record<spec.HttpMethod, boolean> = {
  OPTIONS: true,
  GET: true,
  POST: false,
  PUT: false,
  DELETE: false,
  HEAD: true,
  PATCH: false,
  TRACE: true,
};
