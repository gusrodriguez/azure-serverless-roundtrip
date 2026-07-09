import * as pulumi from "@pulumi/pulumi";

// Import all infrastructure modules so they are created.
import { resourceGroup } from "./resource-group";
import { appInsights } from "./monitoring";
import { functionAppName, functionAppHostname } from "./functions";
import { staticWebAppUrl } from "./static-web-app";
import { cosmosEndpoint } from "./cosmos";
import { serviceBusNamespace } from "./service-bus";

// ── Stack outputs ──────────────────────────────────────────────────────
// These are displayed by `pulumi up` and queryable via `pulumi stack output`.

/** Name of the resource group containing all resources. */
export const resourceGroupName = resourceGroup.name;

/** Function App default URL. */
export const functionAppUrl = pulumi.interpolate`https://${functionAppHostname}`;

/** Static Web App default URL. */
export const staticWebAppUrl_ = pulumi.interpolate`https://${staticWebAppUrl}`;

/** Cosmos DB endpoint (for debugging / integration tests). */
export const cosmosDbEndpoint = cosmosEndpoint;

/** Service Bus namespace name. */
export const serviceBusNamespaceName = serviceBusNamespace.name;

/** The Azure resource name of the Function App. */
export { functionAppName };

/** Application Insights resource name. */
export const appInsightsName = appInsights.name;
