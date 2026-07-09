import * as storage from "@pulumi/azure-native/storage";
import * as pulumi from "@pulumi/pulumi";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

/**
 * Storage account for Azure Functions runtime (AzureWebJobsStorage).
 *
 * SKU: Standard_LRS (Locally Redundant Storage) — the cheapest storage
 * redundancy option. Fine for a dev/reference project where we do not
 * need geo-redundancy or zone-redundancy.
 */
export const storageAccount = new storage.StorageAccount(`${prefix}store`, {
  // Storage account names must be 3-24 chars, lowercase alphanumeric only.
  accountName: `${prefix}store`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "StorageV2",
  sku: {
    name: "Standard_LRS",
  },
});

/** Primary connection string for the storage account. */
export const storageConnectionString = pulumi
  .all([resourceGroup.name, storageAccount.name])
  .apply(([rgName, accountName]) =>
    storage.listStorageAccountKeysOutput({
      resourceGroupName: rgName,
      accountName,
    }),
  )
  .apply(
    (keys) => {
      const key = keys.keys[0].value;
      return pulumi.interpolate`DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${key};EndpointSuffix=core.windows.net`;
    },
  );
