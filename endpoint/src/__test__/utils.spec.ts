import test from "ava";
import * as spec from "../utils";

test("Validate escapeRegExp works", (t) => {
  t.plan(1);
  t.deepEqual(spec.escapeRegExp("[a-z]"), "\\[a-z\\]");
});
