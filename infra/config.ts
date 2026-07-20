import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const prefix = config.get("prefix") || "azrt";

const azureConfig = new pulumi.Config("azure-native");
export const location = azureConfig.require("location");
