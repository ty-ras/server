/**
 * @file This file simulates file containing protocol definitions in real-life projects.
 */

import * as mp from "./missing-parts";

/* eslint-disable jsdoc/require-jsdoc */

export interface SomeEndpoint {
  method: "GET";
  responseBody: ResponseBody;
  url: {
    urlParam: URLParam;
  };
  query: {
    queryParam?: QueryParam;
  };
  responseHeaders: {
    responseHeader: ResponseHeader;
  };
  requestBody: RequestBody;
}

export const urlParam = "urlParam";
export type URLParam = mp.ProtocolTypeOf<typeof urlParam>;
export const responseBody = "responseBody";
export type ResponseBody = mp.ProtocolTypeOf<typeof responseBody>;
export const queryParam = "queryParam";
export type QueryParam = mp.ProtocolTypeOf<typeof queryParam>;
export const resHeader = "resHeader";
export type ResponseHeader = mp.ProtocolTypeOf<typeof resHeader>;
export const requestBody = "requestBody";
export type RequestBody = mp.ProtocolTypeOf<typeof requestBody>;

export interface SimpleEndpoint {
  method: "GET";
  responseBody: SimpleResponseBody;
}
export const simpleResponseBody = "simpleResponseBody";
export type SimpleResponseBody = mp.ProtocolTypeOf<typeof simpleResponseBody>;

export interface SimpleEndpoint2 {
  method: "POST";
  responseBody: SimpleResponseBody;
}
