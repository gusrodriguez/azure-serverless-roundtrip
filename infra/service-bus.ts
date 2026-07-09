import * as servicebus from "@pulumi/azure-native/servicebus";
import * as pulumi from "@pulumi/pulumi";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

/**
 * Service Bus namespace.
 *
 * Tier: Basic — the cheapest option.
 *   - Basic: Queues only, no Topics/Subscriptions, no sessions.
 *     Priced per million operations (first 13M/month ~$0.05).
 *   - Standard: Adds Topics/Subscriptions, sessions, duplicate detection.
 *     $10/month base + per-operation charges.
 *   - Premium: Dedicated capacity, predictable performance, $677+/month.
 *
 * Basic is sufficient here because we only need a single queue.
 * If we later need Topics (pub/sub fan-out), we would upgrade to Standard.
 */
export const serviceBusNamespace = new servicebus.Namespace(
  `${prefix}-sb`,
  {
    namespaceName: `${prefix}-sb`,
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
      name: "Basic",
      tier: "Basic",
    },
  },
);

/**
 * Queue: "tasks"
 *
 * maxDeliveryCount: 5 — messages are dead-lettered after 5 failed attempts.
 * deadLetteringOnMessageExpiration: true — expired messages go to the
 *   dead-letter sub-queue instead of being silently discarded.
 */
export const tasksQueue = new servicebus.Queue(`${prefix}-tasks-queue`, {
  queueName: "tasks",
  namespaceName: serviceBusNamespace.name,
  resourceGroupName: resourceGroup.name,
  maxDeliveryCount: 5,
  deadLetteringOnMessageExpiration: true,
});

/**
 * Retrieve the RootManageSharedAccessKey connection string.
 * This key is created automatically with every Service Bus namespace.
 */
export const serviceBusConnectionString = pulumi
  .all([resourceGroup.name, serviceBusNamespace.name])
  .apply(([rgName, nsName]) =>
    servicebus.listNamespaceKeysOutput({
      resourceGroupName: rgName,
      namespaceName: nsName,
      authorizationRuleName: "RootManageSharedAccessKey",
    }),
  )
  .apply((keys) => keys.primaryConnectionString);
