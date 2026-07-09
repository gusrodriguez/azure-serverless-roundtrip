import * as web from "@pulumi/azure-native/web";
import { prefix } from "./config";
import { resourceGroup } from "./resource-group";

/**
 * Azure Static Web App — Free tier.
 *
 * The Free tier includes:
 *   - 100 GB bandwidth per month
 *   - 2 custom domains
 *   - Built-in authentication
 *   - Globally distributed CDN
 *   - Free SSL certificates
 *
 * Sufficient for a reference/dev project. Standard tier ($9/month) adds
 * SLA guarantees, more custom domains, and larger app size limits.
 */
export const staticWebApp = new web.StaticSite(`${prefix}-swa`, {
  name: `${prefix}-swa`,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  sku: {
    name: "Free",
    tier: "Free",
  },
});

/** The default hostname of the Static Web App (without https://). */
export const staticWebAppUrl = staticWebApp.defaultHostname;
