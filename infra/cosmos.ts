import * as documentdb from "@pulumi/azure-native/documentdb";
import * as pulumi from "@pulumi/pulumi";
import { prefix, location } from "./config";
import { resourceGroup } from "./resource-group";

/**
 * Cosmos DB account — NoSQL (SQL/DocumentDB) API.
 *
 * Free tier provisioned throughput (NOT serverless):
 *   - enableFreeTier: true gives us 1000 RU/s + 25 GB storage for free,
 *     forever (one free-tier account per subscription).
 *   - Serverless would charge per RU consumed with no monthly free grant.
 *     It can be cheaper for very sporadic traffic, but the free tier's
 *     1000 RU/s provisioned throughput is effectively zero-cost for a
 *     reference/dev project and offers predictable performance.
 *
 * Consistency: Session — the default and cheapest read consistency level.
 *   It guarantees read-your-own-writes per session, which is exactly what
 *   we need (the HTTP caller sees their own write immediately).
 *
 * Single region — no replication costs.
 */
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

/** SQL database inside the Cosmos account. */
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

/**
 * Container: "items"
 *
 * Partition key: /id (which maps to correlationId in our domain).
 *   - Efficient for point reads/writes: each task is read/written by its
 *     own correlationId, so every operation is a single-partition hit.
 *   - Listing all items is a cross-partition query, but that is perfectly
 *     fine at this scale (low volume reference project). High-cardinality
 *     partition keys like /id also distribute storage evenly.
 *
 * Throughput: 400 RU/s — the minimum for provisioned throughput and fully
 * covered by the free tier's 1000 RU/s allowance.
 */
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

/** Cosmos DB endpoint URL. */
export const cosmosEndpoint = cosmosAccount.documentEndpoint;

/** Cosmos DB primary key (read-write). */
export const cosmosPrimaryKey = pulumi
  .all([resourceGroup.name, cosmosAccount.name])
  .apply(([rgName, accountName]) =>
    documentdb.listDatabaseAccountKeysOutput({
      resourceGroupName: rgName,
      accountName,
    }),
  )
  .apply((keys) => keys.primaryMasterKey);
