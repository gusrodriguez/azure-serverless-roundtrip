import * as servicebus from "@pulumi/azure-native/servicebus";
import * as pulumi from "@pulumi/pulumi";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

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

export const tasksQueue = new servicebus.Queue(`${prefix}-tasks-queue`, {
  queueName: "tasks",
  namespaceName: serviceBusNamespace.name,
  resourceGroupName: resourceGroup.name,
  maxDeliveryCount: 5,
  deadLetteringOnMessageExpiration: true,
});

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
