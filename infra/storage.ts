import * as storage from "@pulumi/azure-native/storage";
import * as pulumi from "@pulumi/pulumi";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

export const storageAccount = new storage.StorageAccount(`${prefix}store`, {
  accountName: `${prefix}store`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "StorageV2",
  sku: {
    name: "Standard_LRS",
  },
});

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
