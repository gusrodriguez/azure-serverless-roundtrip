import * as operationalinsights from "@pulumi/azure-native/operationalinsights";
import * as insights from "@pulumi/azure-native/insights";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

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

export const appInsights = new insights.Component(`${prefix}-ai`, {
  resourceName: `${prefix}-ai`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "web",
  applicationType: "web",
  workspaceResourceId: logAnalyticsWorkspace.id,
});

export const appInsightsConnectionString = appInsights.connectionString;

export const appInsightsInstrumentationKey = appInsights.instrumentationKey;
