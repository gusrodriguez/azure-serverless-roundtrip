import * as web from "@pulumi/azure-native/web";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

export const staticWebApp = new web.StaticSite(`${prefix}-swa`, {
  name: `${prefix}-swa`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  sku: {
    name: "Free",
    tier: "Free",
  },
});

export const staticWebAppUrl = staticWebApp.defaultHostname;
