/**
 * @file This file contains method to start using builders in {@link stages}.
 */

/* eslint-disable @typescript-eslint/ban-types */

import * as stages from "./stages";

/**
 * Helper function to create {@link stages.AppEndpointBuilderStage0} with only 2 generic arguments.
 * @returns A new instance of {@link stages.AppEndpointBuilderStage0} without any metadata or endpoints defined.
 */
export const startBuildingAPI = <TContext, TStateInfo>() =>
  new stages.AppEndpointBuilderStage0<
    TContext,
    TStateInfo,
    unknown,
    unknown,
    {},
    {},
    {}
  >({}, {});
