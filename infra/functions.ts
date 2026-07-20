import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";
import { storageConnectionString } from "./storage";
import { appInsightsConnectionString } from "./monitoring";
import { serviceBusConnectionString } from "./service-bus";
import { cosmosEndpoint, cosmosPrimaryKey } from "./cosmos";
import { staticWebAppUrl } from "./static-web-app";

export const appServicePlan = new web.AppServicePlan(`${prefix}-plan`, {
  name: `${prefix}-plan`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "functionapp",
  sku: {
    name: "Y1",
    tier: "Dynamic",
  },
});

export const functionApp = new web.WebApp(`${prefix}-func`, {
  name: `${prefix}-func`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "functionapp",
  serverFarmId: appServicePlan.id,
  siteConfig: {
    appSettings: [
      {
        name: "AzureWebJobsStorage",
        value: storageConnectionString,
      },
      {
        name: "FUNCTIONS_WORKER_RUNTIME",
        value: "node",
      },
      {
        name: "FUNCTIONS_EXTENSION_VERSION",
        value: "~4",
      },
      {
        name: "WEBSITE_NODE_DEFAULT_VERSION",
        value: "~20",
      },
      {
        name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
        value: appInsightsConnectionString,
      },
      {
        name: "SERVICE_BUS_CONNECTION",
        value: serviceBusConnectionString,
      },
      {
        name: "SERVICE_BUS_QUEUE_NAME",
        value: "tasks",
      },
      {
        name: "COSMOS_ENDPOINT",
        value: cosmosEndpoint,
      },
      {
        name: "COSMOS_KEY",
        value: cosmosPrimaryKey,
      },
      {
        name: "COSMOS_DATABASE",
        value: "round-trip-db",
      },
      {
        name: "COSMOS_CONTAINER",
        value: "items",
      },
    ],
    cors: {
      allowedOrigins: [
        pulumi.interpolate`https://${staticWebAppUrl}`,
      ],
    },
    nodeVersion: "~20",
  },
  httpsOnly: true,
});

export const functionAppName = functionApp.name;

export const functionAppHostname = functionApp.defaultHostName;
