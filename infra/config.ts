import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

/** Resource name prefix. Defaults to "azrt". */
export const prefix = config.get("prefix") || "azrt";

/**
 * Location comes from the azure-native provider config
 * (set in Pulumi.yaml as westeurope by default).
 */
const azureConfig = new pulumi.Config("azure-native");
export const location = azureConfig.require("location");
