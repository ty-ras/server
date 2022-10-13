/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
import test from "ava";
import * as spec from "..";
import * as common from "./common";

test("Handlers: Validate all batch spec combinations", (t) => {
  t.plan(1);
  // There are 4 boolean things to vary, therefore causing 2⁴ = 16 variations
  // Invoke them all to make sure compiler catches correctly all overload variations
  // Use method which can have body, in order to catch compilation errors when using non-body builder methods with body-enabled HTTP methods.
  const builder = spec.startBuildingAPI().atURL`/path`;
  const mdArgs = {};
  const method = "POST";
  const output = common.outputSpec("");
  const headers = common.stringEncoderSpec({}, () => ({ required: true }));
  const query = common.stringDecoderSpec({}, () => ({ required: true }));
  const input = common.inputSpec("");
  const state = common.state;
  {
    const endpointHandler = () => "";
    // Without response headers, without body, without query, without request headers
    builder.batchSpec({
      state,
      method,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, without body, without query, with request headers
    builder.batchSpec({
      state,
      method,
      headers,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, without body, with query, without request headers
    builder.batchSpec({
      state,
      method,
      query,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, without body, with query, with request headers
    builder.batchSpec({
      state,
      method,
      query,
      headers,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, with body, without query, without request headers
    builder.batchSpec({
      state,
      method,
      input,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, with body, without query, with request headers
    builder.batchSpec({
      state,
      method,
      headers,
      input,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, with body, with query, without request headers
    builder.batchSpec({
      state,
      method,
      query,
      input,
      endpointHandler,
      output,
      mdArgs,
    });
    // Without response headers, with body, with query, with request headers
    builder.batchSpec({
      state,
      method,
      query,
      headers,
      input,
      endpointHandler,
      output,
      mdArgs,
    });
  }
  {
    const endpointHandler = () => ({
      body: "",
      headers: {},
    });
    const responseHeaders = common.stringEncoderSpec({}, () => ({
      required: true,
    }));
    // With response headers, without body, without query, without request headers
    builder.batchSpec({
      state,
      method,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, without body, without query, with request headers
    builder.batchSpec({
      state,
      method,
      headers,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, without body, with query, without request headers
    builder.batchSpec({
      state,
      method,
      query,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, without body, with query, with request headers
    builder.batchSpec({
      state,
      method,
      query,
      headers,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, with body, without query, without request headers
    builder.batchSpec({
      state,
      method,
      input,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, with body, without query, with request headers
    builder.batchSpec({
      state,
      method,
      headers,
      input,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, with body, with query, without request headers
    builder.batchSpec({
      state,
      method,
      query,
      input,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
    // With response headers, with body, with query, with request headers
    builder.batchSpec({
      state,
      method,
      query,
      headers,
      input,
      endpointHandler,
      responseHeaders,
      output,
      mdArgs,
    });
  }
  t.pass("This only exists to make sure all usecases compile successfully.");
});
