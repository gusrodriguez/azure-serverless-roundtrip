import * as pulumi from "@pulumi/pulumi";

import { resourceGroup } from "./resource-group";
import { appInsights } from "./monitoring";
import { functionAppName, functionAppHostname } from "./functions";
import { staticWebAppUrl } from "./static-web-app";
import { cosmosEndpoint } from "./cosmos";
import { serviceBusNamespace } from "./service-bus";

export const resourceGroupName = resourceGroup.name;
export const functionAppUrl = pulumi.interpolate`https://${functionAppHostname}`;
export const staticWebAppUrl_ = pulumi.interpolate`https://${staticWebAppUrl}`;
export const cosmosDbEndpoint = cosmosEndpoint;
export const serviceBusNamespaceName = serviceBusNamespace.name;
export { functionAppName };
export const appInsightsName = appInsights.name;
