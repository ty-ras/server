import type { ExecutionContext } from "ava";
import type * as md from "metadata-openapi";
import type { OpenAPIV3 as openapi } from "openapi-types";

export const validateMetadata = (
  c: ExecutionContext,
  metadata: md.FinalMetadata,
) => {
  c.deepEqual(
    metadata,
    expectedOpenAPIDocument,
    "The metadata must be expected",
  );
};

export const infoObject: openapi.InfoObject = {
  title: "Hello",
  version: "0.0.1",
};

const expectedOpenAPIDocument: md.FinalMetadata = {
  openapi: "3.0.3",
  info: infoObject,
  paths: {
    "/api/something/{urlParam}": {
      description: "Do something",
      parameters: [
        {
          description: "The URL param",
          in: "url",
          name: "urlParam",
          required: true,
          schema: {
            description: "string",
            pattern: "[^/]+",
            type: "string",
          },
        },
      ],
      get: {
        description: "Perform the thing",
        parameters: [
          {
            description: "The query param",
            in: "query",
            name: "queryParam",
            required: false,
            schema: {
              description:
                "This is fallback value for when the automatic JSON schema generation failed",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              example: "1970-01-01T00:00:00.000Z",
              schema: {
                description: "Timestamp in ISO format.",
                type: "string",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                example: "The example response",
                schema: {
                  description: "string",
                  type: "string",
                },
              },
            },
            description: "The response",
            headers: {
              responseHeader: {
                description: "The response header",
                required: true,
                schema: {
                  description:
                    "This is fallback value for when the automatic JSON schema generation failed",
                },
              },
            },
          },
          400: {
            description: "If URL or query fail validation.",
          },
          401: {
            description: "If authentication failed.",
          },
          422: {
            description: "If request body validation fails.",
          },
        },
        security: [
          {},
          {
            authentication: [],
          },
        ],
      },
    },
  },
  components: {
    securitySchemes: {
      authentication: {
        scheme: "bearer",
        type: "http",
      },
    },
  },
};
