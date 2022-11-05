// Really waiting for that "export type *": https://github.com/microsoft/TypeScript/issues/37238
// If we just do "export * from", our index.[m]js file ends up with "export" statement as well, thus causing runtime errors.
// Another option is rename .d.ts files into .ts files and end up with a bunch of empty .[m]js files and index.[m]js exporting those - not very optimal either.
export type {
  BatchSpecificationHeaderArgs,
  BatchSpecificationQueryArgs,
  BatchSpecificationResponseHeaderArgs,
  BatchSpecificationWithBody,
  BatchSpecificationWithBodyWithHeaders,
  BatchSpecificationWithBodyWithoutHandler,
  BatchSpecificationWithoutBody,
  BatchSpecificationWithoutBodyWithHeaders,
  BatchSpecificationWithoutBodyWithoutHandler,
  EndpointSpecArgsJustBody,
  EndpointSpecArgsWithBody,
  EndpointSpecArgsWithHandler,
  EndpointSpecArgsWithoutBody,
} from "./batch";
export * from "./common";
export * from "./stage0";
export * from "./stage1";
export * from "./stage2";
export * from "./stage3";
