import * as documentdb from "@pulumi/azure-native/documentdb";
import * as pulumi from "@pulumi/pulumi";
import { prefix, location } from "./config";
import { resourceGroup } from "./resource-group";

export const cosmosAccount = new documentdb.DatabaseAccount(
  `${prefix}-cosmos`,
  {
    accountName: `${prefix}-cosmos`,
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    kind: "GlobalDocumentDB",
    databaseAccountOfferType: "Standard",
    enableFreeTier: true,
    consistencyPolicy: {
      defaultConsistencyLevel: "Session",
    },
    locations: [
      {
        locationName: location,
        failoverPriority: 0,
        isZoneRedundant: false,
      },
    ],
  },
);

export const cosmosDatabase = new documentdb.SqlResourceSqlDatabase(
  `${prefix}-db`,
  {
    accountName: cosmosAccount.name,
    resourceGroupName: resourceGroup.name,
    databaseName: "round-trip-db",
    resource: {
      id: "round-trip-db",
    },
  },
);

export const cosmosContainer = new documentdb.SqlResourceSqlContainer(
  `${prefix}-items`,
  {
    accountName: cosmosAccount.name,
    resourceGroupName: resourceGroup.name,
    databaseName: cosmosDatabase.name,
    containerName: "items",
    resource: {
      id: "items",
      partitionKey: {
        paths: ["/id"],
        kind: "Hash",
      },
    },
    options: {
      throughput: 400,
    },
  },
);

export const cosmosEndpoint = cosmosAccount.documentEndpoint;

export const cosmosPrimaryKey = pulumi
  .all([resourceGroup.name, cosmosAccount.name])
  .apply(([rgName, accountName]) =>
    documentdb.listDatabaseAccountKeysOutput({
      resourceGroupName: rgName,
      accountName,
    }),
  )
  .apply((keys) => keys.primaryMasterKey);
