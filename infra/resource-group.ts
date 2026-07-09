import * as resources from "@pulumi/azure-native/resources";
import { prefix, location } from "./config";

export const resourceGroup = new resources.ResourceGroup(`${prefix}-rg`, {
  resourceGroupName: `${prefix}-rg`,
  location,
});
