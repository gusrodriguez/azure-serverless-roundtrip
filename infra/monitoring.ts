import * as operationalinsights from "@pulumi/azure-native/operationalinsights";
import * as insights from "@pulumi/azure-native/insights";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

/**
 * Log Analytics workspace.
 *
 * SKU: PerGB2018 — the only generally-available SKU for new workspaces.
 * The legacy "Free" tier is no longer available for creation.
 * PerGB2018 with low ingestion stays within the 5 GB/month free allowance
 * on pay-as-you-go subscriptions, making it effectively free for dev use.
 */
export const logAnalyticsWorkspace =
  new operationalinsights.Workspace(`${prefix}-logs`, {
    workspaceName: `${prefix}-logs`,
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
      name: "PerGB2018",
    },
    retentionInDays: 30,
  });

/**
 * Application Insights — connected to the Log Analytics workspace above.
 * Free for the first 5 GB/month of data ingestion.
 */
export const appInsights = new insights.Component(`${prefix}-ai`, {
  resourceName: `${prefix}-ai`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "web",
  applicationType: "web",
  workspaceResourceId: logAnalyticsWorkspace.id,
});

/** Connection string used by the Function App for telemetry. */
export const appInsightsConnectionString = appInsights.connectionString;

/** Instrumentation key (legacy, but still required by some SDKs). */
export const appInsightsInstrumentationKey = appInsights.instrumentationKey;
