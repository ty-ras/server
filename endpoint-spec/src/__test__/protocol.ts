import * as data from "../../data-io-ts";
import * as t from "io-ts";
import * as tt from "io-ts-types";

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

export const urlParam = t.string;
export type URLParam = data.ProtocolTypeOf<typeof urlParam>;
export const responseBody = t.string;
export type ResponseBody = data.ProtocolTypeOf<typeof responseBody>;
export const queryParam = tt.IntFromString;
export type QueryParam = data.ProtocolTypeOf<typeof queryParam>;
export const resHeader = tt.NumberFromString;
export type ResponseHeader = data.ProtocolTypeOf<typeof resHeader>;
export const requestBody = tt.DateFromISOString;
export type RequestBody = data.ProtocolTypeOf<typeof requestBody>;

export interface SimpleEndpoint {
  method: "GET";
  responseBody: SimpleResponseBody;
}
export const simpleResponseBody = t.string;
export type SimpleResponseBody = data.ProtocolTypeOf<typeof simpleResponseBody>;

export interface SimpleEndpoint2 {
  method: "POST";
  responseBody: SimpleResponseBody;
}
